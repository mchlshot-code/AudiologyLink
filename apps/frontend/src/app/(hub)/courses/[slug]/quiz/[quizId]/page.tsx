"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Mock Quiz
const question = {
    text: "According to the PTM framework, what is the primary objective of sound therapy at night for sleep disturbance?",
    options: [
        "To completely mask the tinnitus sound so it cannot be heard.",
        "To reduce the contrast between the tinnitus and the quiet environment.",
        "To condition the auditory cortex to ignore high frequencies.",
        "To provide a distraction rhythmic enough to induce REM sleep."
    ]
};

export default function QuizEnginePage({ params }: { params: { slug: string, quizId: string } }) {
    const [selected, setSelected] = useState<string>("");
    const [submitted, setSubmitted] = useState(false);

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">

            <div className="flex items-center justify-between text-sm">
                <Link href={`/hub/courses/${params.slug}/lesson/3`} className="inline-flex items-center font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lesson
                </Link>
                <div className="text-muted-foreground font-medium flex items-center gap-2">
                    Question 1 of 5
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                    <span>Progress</span>
                    <span>20%</span>
                </div>
                <Progress value={20} className="h-2 [&>div]:bg-brand-cyan" />
            </div>

            <Card className="border-border/60 shadow-md">
                <CardContent className="p-6 sm:p-8 md:p-10 space-y-8">

                    <h2 className="text-xl sm:text-2xl font-semibold leading-relaxed text-foreground">
                        {question.text}
                    </h2>

                    <RadioGroup value={selected} onValueChange={setSelected} className="space-y-4" disabled={submitted}>
                        {question.options.map((opt, i) => (
                            <div key={i} className={`flex items-center space-x-3 border rounded-lg p-4 transition-colors cursor-pointer
                                ${selected === opt ? "border-brand-cyan bg-brand-cyan/5" : "border-border/40 bg-muted/20 hover:border-brand-cyan/40"}
                                ${submitted && i === 1 ? "border-success bg-success/10" : ""}
                                ${submitted && selected === opt && i !== 1 ? "border-destructive bg-destructive/10" : ""}
                            `}>
                                <RadioGroupItem value={opt} id={`opt-${i}`} className={selected === opt ? "text-brand-cyan border-brand-cyan" : ""} />
                                <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer font-normal text-base leading-relaxed">
                                    {opt}
                                </Label>
                                {submitted && i === 1 && (
                                    <CheckCircle2 className="text-success h-5 w-5" />
                                )}
                            </div>
                        ))}
                    </RadioGroup>

                    {submitted && (
                        <div className="bg-success/10 border border-success/20 rounded-lg p-4 mt-6 animate-in slide-in-from-bottom-2">
                            <h4 className="font-semibold text-success flex items-center gap-2 mb-1">
                                <CheckCircle2 className="h-4 w-4" /> Correct
                            </h4>
                            <p className="text-sm text-foreground/80">
                                Reducing the contrast between the tinnitus and the quiet environment (Habituation) is the goal, rather than total masking.
                            </p>
                        </div>
                    )}

                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                {!submitted ? (
                    <Button
                        size="lg"
                        className="bg-brand-cyan hover:bg-brand-cyan/90 text-primary-foreground min-w-[140px]"
                        disabled={!selected}
                        onClick={() => setSubmitted(true)}
                    >
                        Submit Answer
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px] gap-2"
                    >
                        Next Question <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
