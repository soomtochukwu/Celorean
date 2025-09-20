import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Use a strong secret in production; ensure AUTH_SECRET is set in your environment.
// Use a stable fallback in development to keep signatures consistent across routes.
const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret";

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(payloadB64: string) {
  return b64url(crypto.createHmac("sha256", AUTH_SECRET).update(payloadB64).digest());
}

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    const iat = now;
    const exp = now + 5 * 60 * 1000; // 5 minutes

    const url = new URL(req.url);
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
    const origin = `${url.protocol}//${url.host}`;

    const nonce = b64url(crypto.randomBytes(16));

    const payload = { nonce, iat, exp, origin, host };
    const payloadB64 = b64url(JSON.stringify(payload));
    const signature = sign(payloadB64);
    const token = `${payloadB64}.${signature}`;

    return NextResponse.json({
      token,
      nonce,
      issuedAt: new Date(iat).toISOString(),
      domain: host,
      uri: origin,
      ttl: 300,
    });
  } catch (err: any) {
    console.error("[auth/nonce] error", err);
    return NextResponse.json({ error: "Failed to create nonce" }, { status: 500 });
  }
}