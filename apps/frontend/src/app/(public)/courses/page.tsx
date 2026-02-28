import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BarChart, Lock, ArrowRight, AlertCircle, BookOpen } from "lucide-react";
import Link from "next/link";

interface StrapiCourse {
    id: number;
    attributes: {
        title: string;
        slug: string;
        description: string;
        difficulty_level: string;
        estimated_hours: number;
        category?: {
            data?: {
                attributes?: {
                    name: string;
                }
            } | null;
        };
    };
}

function formatCourse(strapiCourse: StrapiCourse) {
    const { id, attributes } = strapiCourse;
    return {
        id: id.toString(),
        title: attributes.title,
        description: attributes.description || "",
        difficulty: attributes.difficulty_level || "Standard",
        duration: `${attributes.estimated_hours || 0} Hrs`,
        category: attributes.category?.data?.attributes?.name || "Uncategorized",
        slug: attributes.slug
    };
}

export default async function CoursesPage() {
    let courses: StrapiCourse[] | null = null;
    let fetchError = false;

    try {
        const baseUrl = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:1337";
        const res = await fetch(`${baseUrl}/api/courses?populate=category`, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            throw new Error(`Strapi returned ${res.status}`);
        }

        const json = await res.json();
        courses = json.data;
    } catch (err) {
        console.error("Error fetching courses from Strapi:", err);
        fetchError = true;
    }

    return (
        <div className="min-h-screen bg-background border-t border-border/40">

            {/* Header */}
            <div className="bg-primary/5 py-12 md:py-16 border-b border-border/50">
                <div className="container max-w-6xl px-4 md:px-6">
                    <div className="flex items-center gap-3 text-brand-cyan mb-4">
                        <Lock className="h-6 w-6" />
                        <h1 className="text-sm font-bold uppercase tracking-widest">Tier 2 Premium</h1>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-primary dark:text-foreground sm:text-4xl">
                        Course Catalogue
                    </h2>
                    <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                        Structured, evidence-based coursework for audiology students. Registration and subscription required to access lesson materials.
                    </p>
                </div>
            </div>

            {/* Course Grid */}
            <div className="container max-w-6xl px-4 md:px-6 py-12">
                {fetchError || !courses ? (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-8 text-center flex flex-col items-center gap-3">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <h3 className="text-lg font-semibold text-destructive">Unable to load courses</h3>
                        <p className="text-sm text-destructive/80 max-w-sm">
                            We couldn&apos;t connect to the content system. Please try again later.
                        </p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <div className="mx-auto bg-muted h-16 w-16 rounded-full flex items-center justify-center mb-4">
                            <BookOpen className="h-8 w-8 opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No courses available</h3>
                        <p>We are currently building our course curriculum.</p>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((strapiCourse) => {
                            const course = formatCourse(strapiCourse);
                            return (
                                <Card key={course.id} className="flex flex-col group overflow-hidden border-border/60 hover:border-brand-cyan/40 hover:shadow-lg transition-all duration-300">
                                    {/* Top Banner indicating premium tier */}
                                    <div className="h-2 w-full bg-brand-cyan/20 group-hover:bg-brand-cyan transition-colors" />

                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                                {course.category}
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                                            {course.title}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="flex-1 pb-4">
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                            {course.description}
                                        </p>

                                        {/* Meta details */}
                                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/80 mt-auto">
                                            <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                                                <BarChart className="h-3.5 w-3.5" />
                                                {course.difficulty}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                                                <Clock className="h-3.5 w-3.5" />
                                                {course.duration}
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-4 border-t border-border/40 bg-muted/10">
                                        <Button className="w-full justify-between bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-md transition-all" asChild>
                                            <Link href={`/courses/${course.slug}`}>
                                                View Syllabus <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
