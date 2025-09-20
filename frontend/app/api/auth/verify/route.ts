import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { verifyMessage } from "viem";

// Use a strong secret in production; ensure AUTH_SECRET is set in your environment.
// Use a stable fallback in development to keep signatures consistent across routes.
const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret";

function b64urlToBuf(b64url: string) {
  const pad = 4 - (b64url.length % 4);
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + (pad < 4 ? "=".repeat(pad) : "");
  return Buffer.from(b64, "base64");
}

function verifyToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 2) throw new Error("Malformed token");
  const [payloadB64, signature] = parts;
  const expected = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  if (expected !== signature) throw new Error("Bad token signature");
  const payload = JSON.parse(b64urlToBuf(payloadB64).toString("utf8"));
  if (!payload || typeof payload !== "object") throw new Error("Invalid payload");
  if (Date.now() > Number(payload.exp)) throw new Error("Token expired");
  return payload as { nonce: string; iat: number; exp: number; origin: string; host: string };
}

function sessionSign(data: string) {
  return crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { address, signature, token, chainId, walletType } = await req.json();

    if (!address || typeof address !== "string" || !address.startsWith("0x")) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }
    if (!signature || typeof signature !== "string") {
      return NextResponse.json({ error: "Signature required" }, { status: 400 });
    }
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    // Ensure signature is a valid 0x-hex string for viem verifyMessage types
    if (!/^0x[0-9a-fA-F]+$/.test(signature)) {
      return NextResponse.json({ error: "Signature format invalid" }, { status: 400 });
    }
    const sigHex = signature as `0x${string}`;

    const payload = verifyToken(token);

    // Reconstruct the message exactly as the client did
    const message = `${payload.host} wants you to sign in with your Ethereum account:\n${address}\n\nURI: ${payload.origin}\nVersion: 1\nChain ID: ${chainId}\nNonce: ${payload.nonce}\nIssued At: ${new Date(payload.iat).toISOString()}`;

    const ok = await verifyMessage({ address: address as `0x${string}`, message, signature: sigHex });
    if (!ok) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Optional: basic walletType sanity
    const wt = walletType === "farcaster" ? "farcaster" : "standard";

    // Create a signed session value: minimal PII, add chainId and walletType
    const session = {
      sub: address.toLowerCase(),
      chainId: Number(chainId) || 0,
      walletType: wt,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
    };

    const sessionJson = JSON.stringify(session);
    const sig = sessionSign(sessionJson);

    // Set httpOnly cookie; SameSite=Lax allows redirect navigation to keep cookie
    const jar = await cookies();
    jar.set("celorean_session", `${sig}.${Buffer.from(sessionJson).toString("base64")}` , {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60, // seconds
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[auth/verify] error", err);
    return NextResponse.json({ error: err?.message || "Verification failed" }, { status: 400 });
  }
}

export const runtime = 'nodejs'