"use client";

import React, { useState, useEffect } from "react";
import SelfQRcodeWrapper, { SelfAppBuilder } from "@selfxyz/qrcode";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

function VerificationPage() {
    const
        // 
        [userId, setUserId] = useState<string | null>(null),
        { push, } = useRouter();

    useEffect(() => {
        // Generate a user ID when the component mounts
        setUserId(uuidv4());
    }, []);

    if (!userId) return null;
    console.log(process.env.NEXT_PUBLIC_SELF_BACKEND_URL);
    // Create the SelfApp configuration
    const selfApp = new SelfAppBuilder({
        appName: "CEN",
        scope: "CEN-scope",
        endpoint: process.env.NEXT_PUBLIC_SELF_BACKEND_URL,
        userId,
        disclosures: { date_of_birth: true, gender: true, nationality: true },
    }).build();

    return (
        <div className="verification-container">
            <h1>Verify Your Identity</h1>
            <p>Scan this QR code with the Self app to verify your identity</p>

            <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={async () => {
                    // Handle successful verification
                    await alert("Verification successful!");
                    await push("/")
                }}
                size={350}
            />

            <p className="text-sm text-gray-500">
                User ID: {userId.substring(0, 8)}...
            </p>
        </div>
    );
}

export default VerificationPage;
