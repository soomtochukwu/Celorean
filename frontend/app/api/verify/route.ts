import { NextRequest, NextResponse } from "next/server";
import { getUserIdentifier, SelfBackendVerifier } from "@selfxyz/core";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proof, publicSignals } = body;

    if (!proof || !publicSignals) {
      return NextResponse.json(
        { message: "Proof and publicSignals are required" },
        { status: 400 }
      );
    }

    // Extract user ID from the proof
    const userId = await getUserIdentifier(publicSignals);
    console.log("Extracted userId:", userId);

    // Initialize and configure the verifier
    const selfBackendVerifier = new SelfBackendVerifier(
      "celorean-dev",
      process.env.NEXT_PUBLIC_SELF_BACKEND_URL,
      "uuid",
      true
    );

    // Verify the proof
    const result = await selfBackendVerifier.verify(proof, publicSignals);

    if (result.isValid) {
      return NextResponse.json({
        status: "success",
        result: true,
        credentialSubject: result.credentialSubject,
      });
    } else {
      return NextResponse.json(
        {
          status: "error",
          result: false,
          message: "Verification failed",
          details: result.isValidDetails,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error verifying proof:", error);
    return NextResponse.json(
      {
        status: "error",
        result: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
