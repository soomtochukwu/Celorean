import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";
import { getAddressesForEnvironment } from "@/contracts";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY!,
});

function toLowerAddress(addr?: string) {
  return (addr || "").toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentAddress, courseId, title, description, issuerName } = body || {};

    if (!studentAddress || typeof studentAddress !== "string") {
      return NextResponse.json({ error: "studentAddress is required" }, { status: 400 });
    }

    // Resolve environment and addresses for provenance
    const url = new URL(req.url);
    const networkParam = (url.searchParams.get("network") || "localhost").toLowerCase();
    const env = (networkParam === "celo" || networkParam === "celo-mainnet" || networkParam === "mainnet")
      ? "mainnet"
      : (networkParam === "celoSepolia" || networkParam === "celo-sepolia" || networkParam === "testnet")
      ? "testnet"
      : "localhost";

    const addresses = getAddressesForEnvironment(env as any);

    const credential = {
      id: crypto.randomUUID(),
      type: "celorean.credential",
      version: "1.0",
      title: title || "Course Completion Credential",
      description: description || "Credential issued by Celorean platform",
      studentAddress: toLowerAddress(studentAddress),
      courseId: typeof courseId === "number" ? courseId : null,
      issuer: {
        name: issuerName || "Celorean Academy",
        contract: addresses?.proxyAddress || null,
        environment: env,
      },
      issuedAt: new Date().toISOString(),
      // Minimal verification payload; could be extended with signatures later
      proof: {
        method: "pinata-ipfs",
        key: "metadata.keyvalues",
      },
    };

    const file = new File([JSON.stringify(credential, null, 2)], `credential_${credential.id}.json`, {
      type: "application/json",
    });

    const upload = await pinata.upload.public.file(file, {
      metadata: {
        name: `credential_${credential.id}`,
        keyvalues: {
          type: "credential",
          student: toLowerAddress(studentAddress),
          courseId: credential.courseId?.toString() || "",
          credentialId: credential.id,
          environment: env,
        },
      },
    });

    return NextResponse.json({
      success: true,
      cid: upload.cid,
      credential,
      gatewayUrl: `${process.env.PINATA_GATEWAY}/ipfs/${upload.cid}`,
      ipfsUrl: `https://ipfs.io/ipfs/${upload.cid}`,
    });
  } catch (err: any) {
    console.error("[credentials/issue] Error:", err);
    return NextResponse.json({ error: "Failed to issue credential" }, { status: 500 });
  }
}