import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

// Use a strong secret in production; ensure AUTH_SECRET is set in your environment.
const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret";

function sessionSign(data: string) {
  return crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { address, chainId, walletType } = await req.json();

    // Validate address format
    if (!address || typeof address !== "string" || !address.startsWith("0x")) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    // Validate chainId
    if (!chainId || typeof chainId !== "number") {
      return NextResponse.json({ error: "Chain ID required" }, { status: 400 });
    }

    // Sanitize walletType
    const wt = walletType === "farcaster" ? "farcaster" : "standard";

    // Create a signed session without signature verification
    // Note: This is less secure as it doesn't cryptographically prove wallet ownership
    const session = {
      sub: address.toLowerCase(),
      chainId: Number(chainId),
      walletType: wt,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
    };

    const sessionJson = JSON.stringify(session);
    const sig = sessionSign(sessionJson);

    // Set httpOnly cookie; SameSite=Lax allows redirect navigation to keep cookie
    const jar = await cookies();
    jar.set("celorean_session", `${sig}.${Buffer.from(sessionJson).toString("base64")}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60, // seconds
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[auth/verify] error", err);
    return NextResponse.json({ error: err?.message || "Authentication failed" }, { status: 400 });
  }
}

export const runtime = 'nodejs'