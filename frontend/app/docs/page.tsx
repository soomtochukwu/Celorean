"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Brain, Lock, CheckCircle, Award, Users, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedGridBackground } from "@/components/animated-grid-background";

export default function DocsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <AnimatedGridBackground />

            {/* Header */}
            <header className="w-full py-4 px-6 glass border-b border-primary/10 sticky top-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <Zap className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold tracking-wider">CELOREAN</span>
                    </Link>
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 py-12">
                <div className="container mx-auto px-6 max-w-4xl">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                            Celorean Documentation
                        </h1>
                        <p className="text-xl text-muted-foreground mb-6">
                            Personalised Learning with Blockchain and AI
                        </p>
                        <div className="flex justify-center gap-2 mb-8">
                            <Badge variant="secondary">MVP</Badge>
                            <Badge variant="outline">Celo Ecosystem</Badge>
                            <Badge variant="outline">AI-Powered</Badge>
                        </div>
                    </div>

                    {/* Overview */}
                    <section className="mb-12">
                        <Card className="glass border-primary/10 glow-border">
                            <CardHeader>
                                <CardTitle className="text-2xl">Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground leading-relaxed">
                                    Celorean is a revolutionary personalised learning system that is undergoing active development in the{" "}
                                    <Link href="https://celo.org/" className="text-primary hover:underline" target="_blank">
                                        Celo ecosystem
                                    </Link>
                                    . It leverages the power of blockchain and AI to create an engaging and{" "}
                                    <strong>rewarding/incentivised</strong> educational experience.
                                </p>
                                <p className="text-muted-foreground leading-relaxed">
                                    Our Minimum Viable Product (MVP) focuses on core functionalities to validate the concept and gather user feedback for future iterations.
                                </p>
                                <div className="flex justify-center mt-6">
                                    <Button asChild>
                                        <Link href="https://gap.karmahq.xyz/project/celorean" target="_blank">
                                            View on KarmaGap
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Key Features */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold mb-8 text-center gradient-text">Key Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personalised Learning Paths */}
                            <Card className="glass border-primary/10 glow-border">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Brain className="h-5 w-5 text-primary" />
                                        </div>
                                        <CardTitle>Personalised Learning Paths</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li>• AI analyses student performance data stored securely on blockchain</li>
                                        <li>• Identifies strengths, weaknesses, and learning styles</li>
                                        <li>• Recommends personalised learning paths with curated content</li>
                                        <li>• Includes text, videos, and quizzes tailored to individual needs</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Interactive Learning Modules */}
                            <Card className="glass border-primary/10 glow-border">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <CardTitle>Interactive Learning Modules</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li>• Gamification elements to boost engagement</li>
                                        <li>• Interactive quizzes and exercises</li>
                                        <li>• Simulations with immediate feedback</li>
                                        <li>• Real-time progress tracking</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Secure Blockchain Ledger */}
                            <Card className="glass border-primary/10 glow-border">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Lock className="h-5 w-5 text-primary" />
                                        </div>
                                        <CardTitle>Secure Blockchain Ledger</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li>• Immutable storage of student performance data</li>
                                        <li>• Completed modules, scores, and achievements</li>
                                        <li>• Ensures data security and transparency</li>
                                        <li>• Tamper-proof educational records</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Checkpoints and Attendance */}
                            <Card className="glass border-primary/10 glow-border">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                        </div>
                                        <CardTitle>Checkpoints & Attendance</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li>• Strategic checkpoints within learning paths</li>
                                        <li>• Ensures mastery of key concepts before progression</li>
                                        <li>• Secure attendance verification methods</li>
                                        <li>• Facial recognition and unique access codes</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Performance & Rewards */}
                    <section className="mb-12">
                        <Card className="glass border-primary/10 glow-border">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Award className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl">Performance Calculation and Rewards</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">
                                    An AI-powered engine calculates student performance based on various factors:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                                        <h4 className="font-semibold mb-2">Module Completion</h4>
                                        <p className="text-sm text-muted-foreground">Completion of modules and checkpoints</p>
                                    </div>
                                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                                        <h4 className="font-semibold mb-2">Assessment Scores</h4>
                                        <p className="text-sm text-muted-foreground">Scores on quizzes and assessments</p>
                                    </div>
                                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                                        <h4 className="font-semibold mb-2">Engagement Time</h4>
                                        <p className="text-sm text-muted-foreground">Time spent on learning activities</p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3">Reward System:</h4>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li>• Virtual badges and points stored on blockchain wallet</li>
                                        <li>• Redeemable points for in-platform privileges</li>
                                        <li>• Real-world benefits like discounts on educational resources</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Technologies */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold mb-8 text-center gradient-text">Key Technologies</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="glass border-primary/10 glow-border">
                                <CardHeader>
                                    <CardTitle>Core Technologies</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">Solidity</Badge>
                                        <Badge variant="secondary">Next.js</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="glass border-primary/10 glow-border">
                                <CardHeader>
                                    <CardTitle>Additional Tools</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">Ethers</Badge>
                                        <Badge variant="outline">Rainbow Kit</Badge>
                                        <Badge variant="outline">Wagmi</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Benefits */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold mb-8 text-center gradient-text">Benefits</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                {
                                    title: "Personalised Learning",
                                    description: "Cater to individual student needs and learning styles",
                                    icon: Brain
                                },
                                {
                                    title: "Improved Engagement",
                                    description: "Gamification elements and interactive modules boost motivation",
                                    icon: Users
                                },
                                {
                                    title: "Secure & Transparent Data",
                                    description: "Blockchain ensures tamper-proof records and data security",
                                    icon: Shield
                                },
                                {
                                    title: "Measurable Progress",
                                    description: "Track performance with clear checkpoints and progress reports",
                                    icon: CheckCircle
                                },
                                {
                                    title: "Reward-Driven Learning",
                                    description: "Motivate students with a rewarding system that recognises achievements",
                                    icon: Award
                                },
                                {
                                    title: "Future-Ready Education",
                                    description: "Prepare students for the digital age with cutting-edge technology",
                                    icon: Zap
                                }
                            ].map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <Card key={index} className="glass border-primary/10 glow-border text-center">
                                        <CardContent className="pt-6">
                                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="font-semibold mb-2">{benefit.title}</h3>
                                            <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    {/* Next Steps */}
                    <section className="mb-12">
                        <Card className="glass border-primary/10 glow-border">
                            <CardHeader>
                                <CardTitle className="text-2xl">Next Steps</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="space-y-3 text-muted-foreground">
                                    <li className="flex items-start space-x-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">1</span>
                                        <span>Develop a user-friendly interface for students, educators, and administrators</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">2</span>
                                        <span>Integrate AI algorithms for personalised learning path generation</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">3</span>
                                        <span>Pilot test the MVP with a small group of students and educators</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">4</span>
                                        <span>Gather feedback and iterate based on user experience to improve the platform</span>
                                    </li>
                                </ol>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Call to Action */}
                    <section className="text-center">
                        <Card className="glass border-primary/10 glow-border">
                            <CardContent className="pt-8 pb-8">
                                <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
                                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                    Celorean's personalised learning system has the potential to revolutionise education by creating a dynamic, secure, and rewarding learning environment for all.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Button size="lg" asChild>
                                        <Link href="/learning">
                                            Start Learning
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" asChild>
                                        <Link href="https://www.celorean.school/" target="_blank">
                                            Visit Website
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="glass border-t border-primary/10 py-8">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Celorean. Revolutionizing education through blockchain and AI technology.
                    </p>
                </div>
            </footer>
        </div>
    );
}