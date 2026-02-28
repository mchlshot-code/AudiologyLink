import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Stethoscope, Award, ArrowRight } from "lucide-react";

export default function PublicHomePage() {
    return (
        <div className="flex flex-col items-center">

            {/* Hero Section */}
            <section className="w-full relative overflow-hidden bg-primary/5 py-24 md:py-32 flex justify-center border-b border-border/50">
                <div className="absolute inset-0 z-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

                <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center max-w-4xl space-y-6">
                    <div className="inline-flex items-center rounded-full border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-1 text-sm font-medium text-brand-cyan mb-4">
                        <span className="flex h-2 w-2 rounded-full bg-brand-cyan mr-2 animate-pulse"></span>
                        Elevating Nigerian Audiology
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-primary dark:text-foreground">
                        Master Clinical Skills. <br className="hidden sm:inline" />
                        <span className="text-brand-cyan">Advance Your Practice.</span>
                    </h1>

                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        The premier clinical education platform designed specifically for Nigerian audiology students and professionals. Interactive case studies, evidence-based courses, and curated resources.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-6">
                        <Button asChild size="lg" className="h-12 px-8 text-base bg-brand-cyan hover:bg-brand-cyan/90 text-primary-foreground">
                            <Link href="/courses">
                                Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                            <Link href="/resources">
                                Free Resources
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="w-full py-20 bg-background flex justify-center">
                <div className="container px-4 md:px-6 max-w-6xl">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                            Why AudiologyLink Education Hub?
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                            We bridge the gap between textbook theory and clinical reality in the Nigerian healthcare context.
                        </p>
                    </div>

                    <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">

                        {/* Feature 1 */}
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-cyan/10 text-brand-cyan mx-auto shadow-sm ring-1 ring-brand-cyan/20">
                                <BookOpen className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">Nigerian Context</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Cases and materials reflecting the realities of practice in Sub-Saharan Africa, not just Western models.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success mx-auto shadow-sm ring-1 ring-success/20">
                                <Stethoscope className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">Clinical Reasoning</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Go beyond multiple-choice quizzes. Navigate interactive patient cases that test your diagnostic decision-making.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto shadow-sm ring-1 ring-destructive/20">
                                <Award className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">Tracked Progress</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Build a portfolio of completed cases and verified courses to demonstrate competency as you develop.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
}
