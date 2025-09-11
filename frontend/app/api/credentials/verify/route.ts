import { NextRequest, NextResponse } from "next/server";

function isCID(str: string) {
  return /^[a-zA-Z0-9]{46,}$/.test(str);
}

export async function POST(req: NextRequest) {
  try {
    const { cid } = await req.json();
    if (!cid || typeof cid !== "string" || !isCID(cid)) {
      return NextResponse.json({ error: "Valid cid is required" }, { status: 400 });
    }

    const url = `${process.env.PINATA_GATEWAY}/ipfs/${cid}`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ valid: false, reason: "Not found on gateway" }, { status: 404 });
    }
    const data = await res.json();

    const valid = Boolean(
      data &&
        typeof data.id === "string" &&
        data.type === "celorean.credential" &&
        data.proof?.method === "pinata-ipfs" &&
        data.studentAddress &&
        data.issuer?.contract
    );

    return NextResponse.json({ valid, data, gatewayUrl: url });
  } catch (err) {
    console.error("[credentials/verify] Error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "POST { cid } to verify credential" });
}