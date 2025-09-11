"use client";

import React, { useState, useEffect } from "react";
import SelfQRcodeWrapper, { SelfAppBuilder } from "@selfxyz/qrcode";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { selfBase64Logo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";
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
    disclosures: {
      name: true,
      expiry_date: true,
      gender: true,
      nationality: true,
    },
  }).build();

  return (
    <div className="verification-container">
      <h1>Verify Your Identity</h1>
      <p>Scan this QR code with the Self app to verify your identity</p>
      <div className="relative p-2 w-fit h-fit rounded-full  flex items-center justify-center mb-6 mx-auto">
        {" "}
        {/* <div className="absolute animate-ping border-2 border-white w-full h-full"></div> */}
        <Zap className="  fill-green-700 absolute animate-pulse rounded-full h-12 w-12 text-primary " />
        {/* <Image
          src={"/logo.svg"}
          className="bg-gray-300 text-green-700 fill-green-700 absolute rounded-full"
          width={50}
          height={50}
          alt={""}
        ></Image> */}
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
