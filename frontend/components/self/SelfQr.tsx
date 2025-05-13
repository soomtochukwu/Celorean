"use client";

import React, { useState, useEffect } from "react";
import SelfQRcodeWrapper, { SelfAppBuilder } from "@selfxyz/qrcode";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { selfBase64Logo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
function SelfQr({
  setIsComplete,
}: {
  setIsComplete: (isComplete: boolean) => void;
}) {
  const //
    [userId, setUserId] = useState<string | null>(null),
    { push } = useRouter();

  useEffect(() => {
    // Generate a user ID when the component mounts
    setUserId(uuidv4());
  }, []);

  if (!userId) return null;
  console.log(process.env.NEXT_PUBLIC_SELF_BACKEND_URL);
  // Create the SelfApp configuration
  const selfApp = new SelfAppBuilder({
    appName: "CELOREAN",
    scope: "CELOREAN-scope",
    endpoint: process.env.NEXT_PUBLIC_SELF_BACKEND_URL,

    logoBase64: selfBase64Logo as string,
    userId,
    disclosures: { date_of_birth: true, gender: true, nationality: true },
  }).build();

  return (
    <div className="verification-container">
      <h1>Verify Your Identity</h1>
      <p>Scan this QR code with the Self app to verify your identity</p>
      <div className="relative p-2 w-fit h-fit rounded-full  flex items-center justify-center mb-6 mx-auto">
        {" "}
        <Image
          src={"/logo.svg"}
          className="bg-gray-300 absolute animate-spin direction-reverse rounded-full"
          width={50}
          height={50}
          alt={""}
        ></Image>
        <div className="h-14 w-14 absolute rounded-full border-2 border-primary border-t-transparent animate-spin"></div>{" "}
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={async () => {
            setIsComplete(true);
          }}
          size={350}
          darkMode
        />
      </div>

      <p className="text-sm text-gray-500">
        User ID: {userId.substring(0, 8)}...
      </p>
    </div>
  );
}

export default SelfQr;
