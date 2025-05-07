'use client';

import React, { useState, useEffect } from 'react';
import SelfQRcodeWrapper, { SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';

function VerificationPage() {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Generate a user ID when the component mounts
        setUserId(uuidv4());
    }, []);

    if (!userId) return null;
    console.log(process.env.NEXT_PUBLIC_SELF_BACKEND_URL)
    // Create the SelfApp configuration
    const selfApp = new SelfAppBuilder({
        appName: "celorean-dev",
        scope: "celorean-dev-scope",
        endpoint: process.env.NEXT_PUBLIC_SELF_BACKEND_URL,
    "self-playground",
    "uuid",
    true,
        disclosures: { date_of_birth: true, gender: true }
    }).build();

    return (
        <div className="verification-container">
            <h1>Verify Your Identity</h1>
            <p>Scan this QR code with the Self app to verify your identity</p>

            <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={() => {
                    // Handle successful verification
                    console.log("Verification successful!");
                    // Redirect or update UI
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
