"use client"

import { useState } from "react"
import { Shield, Upload, FileText, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepProgressTracker } from "@/components/step-progress-tracker"
import { AnimatedSuccessBadge } from "@/components/animated-success-badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const verificationSteps = [
  {
    id: "connect",
    title: "Connect Wallet",
    description: "Connect your Web3 wallet to begin the verification process",
  },
  {
    id: "upload",
    title: "Upload Documents",
    description: "Provide the necessary documents for verification",
  },
  {
    id: "verify",
    title: "Verify Identity",
    description: "Complete the zero-knowledge proof verification",
  },
]

export default function SelfVerification() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleNextStep = () => {
    if (currentStep === 0) {
      setCurrentStep(1)
    } else if (currentStep === 1) {
      setIsUploading(true)
      setTimeout(() => {
        setIsUploading(false)
        setCurrentStep(2)
      }, 2000)
    } else if (currentStep === 2) {
      setIsVerifying(true)
      setTimeout(() => {
        setIsVerifying(false)
        setIsComplete(true)
      }, 3000)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Self-Verification</h1>
        <p className="text-muted-foreground">Verify your identity without revealing sensitive information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="glass border-primary/10 sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Verification Process
              </CardTitle>
              <CardDescription>Complete these steps to verify your identity on the blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <StepProgressTracker steps={verificationSteps} currentStep={currentStep} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {isComplete ? (
            <Card className="glass border-primary/10">
              <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[400px]">
                <AnimatedSuccessBadge message="Verification Complete!" className="mb-6" />
                <div className="text-center max-w-md">
                  <h2 className="text-2xl font-bold mb-2">You're Verified!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your identity has been verified on the blockchain. You now have full access to all Celorean
                    features.
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
                  {currentStep === 0 && "Connect Your Wallet"}
                  {currentStep === 1 && "Upload Your Documents"}
                  {currentStep === 2 && "Complete Verification"}
                </CardTitle>
                <CardDescription>
                  {currentStep === 0 && "Connect your Web3 wallet to begin the verification process"}
                  {currentStep === 1 && "Upload the required documents for identity verification"}
                  {currentStep === 2 && "Complete the zero-knowledge proof verification"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep === 0 && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-center text-muted-foreground mb-6 max-w-md">
                      Connect your wallet to securely verify your identity. We use zero-knowledge proofs to ensure your
                      privacy.
                    </p>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4 py-4">
                    <div className="glass border border-dashed border-primary/30 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-4 text-primary" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop your ID document, or click to browse
                      </p>
                      <Button variant="outline" size="sm" disabled={isUploading}>
                        {isUploading ? "Uploading..." : "Browse Files"}
                      </Button>
                    </div>
                    <div className="glass border border-dashed border-primary/30 rounded-lg p-6 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-4 text-primary" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop proof of address, or click to browse
                      </p>
                      <Button variant="outline" size="sm" disabled={isUploading}>
                        {isUploading ? "Uploading..." : "Browse Files"}
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="flex flex-col items-center justify-center py-10">
                    {isVerifying ? (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-muted-foreground">Generating zero-knowledge proof...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                          <CheckCircle className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-center text-muted-foreground mb-6 max-w-md">
                          Your documents have been processed. Click the button below to complete the verification with a
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
                  disabled={currentStep === 0 || isUploading || isVerifying}
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
                <Button onClick={handleNextStep} disabled={isUploading || isVerifying}>
                  {currentStep === 0 && "Connect Wallet"}
                  {currentStep === 1 && (isUploading ? "Uploading..." : "Upload Documents")}
                  {currentStep === 2 && (isVerifying ? "Verifying..." : "Complete Verification")}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
