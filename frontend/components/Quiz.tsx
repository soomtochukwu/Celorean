"use client";

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number; // index of correct option
}

interface QuizProps {
    title: string;
    questions: Question[];
}

export function Quiz({ title, questions }: QuizProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const handleAnswer = () => {
        if (selectedOption === null) return;

        const correct = questions[currentQuestion].correctAnswer === selectedOption;
        if (correct) {
            setScore(score + 1);
        }
        setIsAnswered(true);
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const handleRetry = () => {
        setCurrentQuestion(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResult(false);
    };

    if (showResult) {
        return (
            <Card className="w-full max-w-2xl mx-auto mt-8 border-2 border-primary/20">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <div className="text-6xl font-bold text-primary mb-4">
                        {Math.round((score / questions.length) * 100)}%
                    </div>
                    <p className="text-xl text-muted-foreground">
                        You scored {score} out of {questions.length}
                    </p>
                    <div className="flex justify-center">
                        <Button onClick={handleRetry} variant="outline" className="mt-4">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Quiz
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const question = questions[currentQuestion];

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                        Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <span className="text-sm font-medium text-primary">
                        Score: {score}
                    </span>
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <h3 className="text-lg font-semibold mt-4">{question.text}</h3>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={selectedOption?.toString()}
                    onValueChange={(val) => !isAnswered && setSelectedOption(parseInt(val))}
                    className="space-y-3"
                >
                    {question.options.map((option, index) => {
                        let itemClass = "flex items-center space-x-2 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-accent";

                        if (isAnswered) {
                            if (index === question.correctAnswer) {
                                itemClass = "flex items-center space-x-2 p-4 rounded-lg border bg-green-100 border-green-500 dark:bg-green-900/20";
                            } else if (index === selectedOption && index !== question.correctAnswer) {
                                itemClass = "flex items-center space-x-2 p-4 rounded-lg border bg-red-100 border-red-500 dark:bg-red-900/20";
                            } else {
                                itemClass = "flex items-center space-x-2 p-4 rounded-lg border opacity-50";
                            }
                        } else if (selectedOption === index) {
                            itemClass = "flex items-center space-x-2 p-4 rounded-lg border border-primary bg-primary/5";
                        }

                        return (
                            <div key={index} className={itemClass} onClick={() => !isAnswered && setSelectedOption(index)}>
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={isAnswered} />
                                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer font-medium">
                                    {option}
                                </Label>
                                {isAnswered && index === question.correctAnswer && (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                )}
                                {isAnswered && index === selectedOption && index !== question.correctAnswer && (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                            </div>
                        );
                    })}
                </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-end">
                {!isAnswered ? (
                    <Button onClick={handleAnswer} disabled={selectedOption === null}>
                        Submit Answer
                    </Button>
                ) : (
                    <Button onClick={handleNext}>
                        {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
