import { NextResponse } from "next/server";
import { getAddressesForEnvironment } from "@/contracts/addresses";

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
  };

  try {
    diagnostics.env = {
      PINATA_JWT: Boolean(process.env.PINATA_JWT),
      PINATA_GATEWAY: Boolean(process.env.PINATA_GATEWAY),
    };

    const envs = ["localhost", "testnet", "mainnet"] as const;
    diagnostics.addresses = {} as any;
    for (const e of envs) {
      try {
        diagnostics.addresses[e] = getAddressesForEnvironment(e as any);
      } catch (err: any) {
        diagnostics.addresses[e] = { error: err?.message || String(err) };
      }
    }

    return NextResponse.json({ ok: true, diagnostics });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err), diagnostics },
      { status: 500 }
    );
  }
}
