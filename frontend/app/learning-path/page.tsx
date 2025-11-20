"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, BookOpen, CheckCircle } from "lucide-react";

interface Module {
    title: string;
    description: string;
    duration: string;
    topics: string[];
}

interface LearningPath {
    title: string;
    description: string;
    modules: Module[];
}

export default function LearningPathPage() {
    const [goal, setGoal] = useState('');
    const [loading, setLoading] = useState(false);
    const [path, setPath] = useState<LearningPath | null>(null);

    const generatePath = async () => {
        if (!goal) return;

        setLoading(true);
        try {
            const res = await fetch('/api/ai/generate-path', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal }),
            });

            if (res.ok) {
                const data = await res.json();
                setPath(data);
            }
        } catch (error) {
            console.error('Error generating path:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                AI Learning Assistant
            </h1>

            <div className="max-w-2xl mx-auto mb-12">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle>What do you want to learn today?</CardTitle>
                        <CardDescription>
                            Enter a topic and our AI will create a personalized curriculum for you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Input
                                placeholder="e.g., DeFi Development, Smart Contract Security..."
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                className="text-lg"
                            />
                            <Button
                                onClick={generatePath}
                                disabled={loading || !goal}
                                size="lg"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
                                Generate
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {path && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">{path.title}</h2>
                        <p className="text-muted-foreground text-lg">{path.description}</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                        {path.modules.map((module, index) => (
                            <Card key={index} className="relative overflow-hidden border-l-4 border-l-primary hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                            Module {index + 1}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {module.duration}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl">{module.title}</CardTitle>
                                    <CardDescription>{module.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {module.topics.map((topic, i) => (
                                            <li key={i} className="flex items-center text-sm">
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                {topic}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
