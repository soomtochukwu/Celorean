import { NextResponse } from "next/server";
import { getUserIdentifier, SelfBackendVerifier } from "@selfxyz/core";
import { UserIdType } from "@selfxyz/core/dist/common/src/utils/circuits/uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { proof, publicSignals } = body;

    if (!proof || !publicSignals) {
      return NextResponse.json(
        { message: "Proof and publicSignals are required" },
        { status: 400 }
      );
    }
    /*     console.log(process.env.NEXT_PUBLIC_SELF_BACKEND_URL);
    const userId = await getUserIdentifier(publicSignals);
    console.log("Extracted userId:", userId); */

    // Initialize and configure the verifier
    const selfBackendVerifier = new SelfBackendVerifier(
      "CELOREAN-scope",
      process.env.NEXT_PUBLIC_SELF_BACKEND_URL as string,
      "uuid",
      true
    );

    // Verify the proof
    const result = await selfBackendVerifier.verify(proof, publicSignals);

    if (result.isValid) {
      console.log(">>>result$ ", result);
      return NextResponse.json({
        status: "success",
        result: true,
        credentialSubject: result,
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
