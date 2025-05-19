"use client";

import { useEffect, useState } from "react";
import { Shield, Upload, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepProgressTracker } from "@/components/step-progress-tracker";
import { AnimatedSuccessBadge } from "@/components/animated-success-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import dynamic from "next/dynamic";
import { useAccount } from "wagmi";
import Image from "next/image";

const SelfQr = dynamic(() => import("@/components/self/SelfQr"), {
  ssr: false,
});

const verificationSteps = [
  {
    id: "connect",
    title: "Connect Wallet",
    description: "Connect your Web3 wallet to begin the verification process",
  },
  {
    id: "verify",
    title: "Verify Identity",
    description: "Complete the zero-knowledge proof verification",
  },
];

export default function SelfVerification() {
  const { isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      setIsVerifying(true);
    } else if (currentStep == 2) {
      // setIsVerifying(false);
      setTimeout(() => {
        setIsComplete(true);
      }, 2000);
    }
  };
  useEffect(() => {
    setCurrentStep(1);
  }, [isConnected]);
  useEffect(() => {
    currentStep === 2 ? null : null;
  }, [currentStep]);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Self-Verification</h1>
        <p className="text-muted-foreground">
          Verify your identity without revealing sensitive information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="glass border-primary/10 sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Verification Process
              </CardTitle>
              <CardDescription>
                Complete these steps to verify your identity on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StepProgressTracker
                steps={verificationSteps}
                currentStep={currentStep}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {isComplete ? (
            <Card className="glass border-primary/10">
              <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[400px]">
                <AnimatedSuccessBadge
                  message="Verification Complete!"
                  className="mb-6"
                />
                <div className="text-center max-w-md">
                  <h2 className="text-2xl font-bold mb-2">You're Verified!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your identity has been verified on the blockchain. You now
                    have full access to all Celorean features.
                  </p>
                  <Button asChild>
                    <a href="/dashboard">Return to Dashboard</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle>
                  {currentStep === 1 && "Wallet Connected"}
                  {currentStep === 2 && "Complete Verification"}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 &&
                    "Connect your Web3 wallet to begin the verification process"}
                  {currentStep === 2 &&
                    "Complete the zero-knowledge proof verification"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep === 1 && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-center text-muted-foreground mb-6 max-w-md">
                      Connect your wallet to securely verify your identity. We
                      use zero-knowledge proofs to ensure your privacy.
                    </p>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="flex flex-col items-center justify-center py-10">
                    {isVerifying ? (
                      <div className="text-center">
                        <div className=" md:block hidden">

                          <SelfQr setIsComplete={setIsComplete} />
                        </div>
                        <button
                          className="bg-[#46c458] md:hidden sm:block p-3 text-black rounded-md"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = `https://redirect.self.xyz/?sessionId=${localStorage.getItem("sessionId")}`;
                            a.click();
                          }}>Since you are on a mobile device, click here.                          </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                          <CheckCircle className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-center text-muted-foreground mb-6 max-w-md">
                          Your documents have been processed. Click the button
                          below to complete the verification with a
                          zero-knowledge proof.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t border-primary/10 p-6">
                <Button
                  variant="outline"
                  disabled={currentStep === 1 || isVerifying}
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
                <Button onClick={handleNextStep} disabled={isVerifying}>
                  {currentStep === 1 && "Continue with SELF"}
                  {isVerifying ? "Verifying..." : ""}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
