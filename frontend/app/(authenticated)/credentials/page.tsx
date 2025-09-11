"use client";

import { BadgeCheck, ExternalLink, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useCeloreanContract from "@/hooks/useCeloreanContract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function CredentialsPage() {
  const {
    isPending,
    // newly added credential helpers
    getCredentialsByStudent,
    issueCredentialForStudent,
    isLecturer,
  } = useCeloreanContract();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [items, setItems] = useState<
    {
      id: string;
      title: string;
      issuer?: string;
      issuedAt?: string;
      txHash?: string;
      cid?: string;
      url?: string;
      courseId?: number;
      metadataUri?: string;
    }[]
  >([]);

  const lecturerStatus = isLecturer(address || "0x0000000000000000000000000000000000000000");
  const isUserLecturer = !!lecturerStatus.data;

  // Call on-chain read as a hook at top-level
  const studentCreds = getCredentialsByStudent(
    address || "0x0000000000000000000000000000000000000000"
  );

  async function issueTestCredential() {
    try {
      if (!isConnected || !address) return;
      setIssuing(true);
      const courseId = 1;
      // First, create & pin metadata JSON to IPFS via our API
      const res = await fetch(`/api/credentials/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentAddress: address,
          courseId,
          title: "Test Credential",
          description: "Issued from UI",
        }),
      });
      const json = await res.json();
      if (!json?.cid) throw new Error("Failed to pin credential metadata");
      const metadataUri = `ipfs://${json.cid}`;
      // Then, record on-chain by calling the contract method
      await issueCredentialForStudent(address, courseId, metadataUri);
      // Hint wagmi to refresh if available
      (studentCreds as any).refetch?.();
    } finally {
      setIssuing(false);
    }
  }

  // Map wagmi data into UI items whenever it changes
  useEffect(() => {
    if (!isConnected || !address) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = (studentCreds as any).data as
      | { id: bigint; student: string; lecturer: string; courseId: bigint; issuedAt: bigint; metadataUri: string }[]
      | undefined;

    if (data && Array.isArray(data)) {
      const mapped = data.map((c) => {
        const id = Number(c.id);
        const issuedAt = new Date(Number(c.issuedAt) * 1000).toISOString();
        const metadataUri = c.metadataUri || "";
        let cid: string | undefined;
        let url: string | undefined;
        if (metadataUri.startsWith("ipfs://")) {
          cid = metadataUri.replace("ipfs://", "");
          url = `https://gateway.pinata.cloud/ipfs/${cid}`;
        } else if (metadataUri.startsWith("https://")) {
          url = metadataUri;
          const m = metadataUri.match(/\/ipfs\/([^/?#]+)/);
          cid = m?.[1];
        }
        return {
          id: String(id),
          title: `Course #${Number(c.courseId)}`,
          issuer: c.lecturer,
          issuedAt,
          cid,
          url,
          courseId: Number(c.courseId),
          metadataUri,
        };
      });
      setItems(mapped);
    } else {
      setItems([]);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, (studentCreds as any).data]);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Credentials</h1>
          <p className="text-muted-foreground">
            View certificates and attestations you have earned
          </p>
        </div>
        {isConnected && isUserLecturer && (
          <Button size="sm" onClick={issueTestCredential} disabled={issuing || isPending}>
            {issuing || isPending ? "Issuing..." : "Issue test credential"}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass border border-primary/10">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isConnected ? (
        <div className="glass border border-primary/10 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-1">Connect your wallet</h2>
          <p className="text-muted-foreground mb-4">
            Connect to view your issued credentials.
          </p>
          <Button asChild>
            <Link href="/login">Connect Wallet</Link>
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="glass border border-primary/10 rounded-lg p-8 text-center">
          <BadgeCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-1">No credentials yet</h2>
          <p className="text-muted-foreground mb-4">
            Complete courses to earn certificates and on-chain proofs.
          </p>
          <Button asChild>
            <Link href="/learning">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((cred) => (
            <Card
              key={(cred as any).id || (cred as any).cid}
              className="glass border border-primary/10"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center">
                  <BadgeCheck className="h-4 w-4 mr-2 text-primary" />
                  {cred.title || "Credential"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {cred.issuer && (
                  <div>
                    Issuer:{" "}
                    <span className="text-foreground">{cred.issuer}</span>
                  </div>
                )}
                {cred.issuedAt && (
                  <div>
                    Issued:{" "}
                    <span className="text-foreground">
                      {new Date(cred.issuedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {(cred as any).cid && (
                  <div className="truncate">CID: {(cred as any).cid}</div>
                )}
                <div className="pt-2 flex gap-3">
                  {(cred as any).url && (
                    <a
                      className="text-primary underline"
                      href={(cred as any).url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </a>
                  )}
                  {(cred as any).cid && (
                    <Link
                      className="text-primary underline"
                      href={`/verification?cid=${(cred as any).cid}`}
                    >
                      Verify
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
