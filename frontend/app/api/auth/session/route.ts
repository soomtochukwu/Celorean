import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export const runtime = 'nodejs';

const AUTH_COOKIE = "celorean_session";
// Use a strong secret in production; ensure AUTH_SECRET is set in your environment.
// Use a stable fallback in development to keep signatures consistent across routes.
const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret";

function verifySessionCookie(value: string) {
  const [sig, payloadB64] = value.split(".");
  if (!sig || !payloadB64) throw new Error("Malformed session");
  const payloadJson = Buffer.from(payloadB64, "base64").toString("utf8");
  const expectedSig = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadJson)
    .digest("hex");
  if (expectedSig !== sig) throw new Error("Bad session signature");
  const session = JSON.parse(payloadJson);
  if (!session || typeof session !== "object") throw new Error("Invalid session payload");
  if (Date.now() > Number(session.exp)) throw new Error("Session expired");
  return session as { sub: string; chainId: number; walletType: string; iat: number; exp: number };
}

export async function GET(_req: NextRequest) {
  try {
    const jar = await cookies();
    const val = jar.get(AUTH_COOKIE)?.value;
    if (!val) return NextResponse.json({ authenticated: false }, { status: 200 });
    try {
      const session = verifySessionCookie(val);
      return NextResponse.json({ authenticated: true, session });
    } catch (e: any) {
      return NextResponse.json({ authenticated: false, error: e?.message || "Invalid session" }, { status: 200 });
    }
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err?.message || "Failed" }, { status: 200 });
  }
}