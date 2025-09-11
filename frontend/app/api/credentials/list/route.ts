import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY!,
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const student = (url.searchParams.get("student") || "").toLowerCase();
    if (!student) {
      return NextResponse.json({ error: "student query param is required" }, { status: 400 });
    }

    const items: any[] = [];

    // Iterate using SDK list iterator with keyvalues filter
    for await (const file of pinata.files.public
      .list()
      .keyvalues({ type: "credential", student })) {
      // Fetch each JSON from gateway to parse metadata
      try {
        const res = await fetch(`${process.env.PINATA_GATEWAY}/ipfs/${file.cid}`);
        const json = await res.json();
        items.push({
          cid: file.cid,
          id: json.id,
          title: json.title,
          issuer: json.issuer?.name,
          issuedAt: json.issuedAt,
          txHash: json.txHash,
          url: `${process.env.PINATA_GATEWAY}/ipfs/${file.cid}`,
        });
      } catch (e) {
        // skip malformed
      }
    }

    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error("[credentials/list] Error:", err);
    return NextResponse.json({ error: "Failed to list credentials" }, { status: 500 });
  }
}