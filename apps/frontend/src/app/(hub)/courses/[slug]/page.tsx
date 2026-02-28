import Link from "next/link";
import { ArrowLeft, PlayCircle, BookOpen, CheckCircle2, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";

interface StrapiLesson {
    id: number;
    attributes: {
        title: string;
        content_type: string;
        sequence_order: number;
        estimated_minutes: number;
    }
}

interface StrapiCourse {
    id: number;
    attributes: {
        title: string;
        description: string;
        lessons?: {
            data: StrapiLesson[];
        };
    }
}

interface CourseProgress {
    resumeLessonId?: number;
    lessonStatus: Record<number, "completed" | "in_progress" | "locked">;
}

async function fetchCourseFromStrapi(slug: string): Promise<StrapiCourse | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:1337";
        // Sort lessons by sequence_order automatically using Strapi's sort parameter
        const res = await fetch(`${baseUrl}/api/courses?filters[slug][$eq]=${slug}&populate[lessons][sort][0]=sequence_order:asc`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data[0] || null;
    } catch {
        return null;
    }
}

async function fetchCourseProgress(slug: string): Promise<CourseProgress | null> {
    const cookieStore = cookies();
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${baseUrl}/api/education/students/courses/${slug}/progress`, {
            credentials: "include",
            headers: {
                Cookie: cookieStore.toString()
            },
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export default async function CourseSyllabusPage({ params }: { params: { slug: string } }) {
    const [course, progress] = await Promise.all([
        fetchCourseFromStrapi(params.slug),
        fetchCourseProgress(params.slug)
    ]);

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-destructive/20 bg-destructive/10 animate-in fade-in max-w-2xl mx-auto">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h2 className="text-xl font-semibold text-destructive mb-2">Course not found</h2>
                <p className="text-muted-foreground mb-6">We couldn&apos;t load the syllabus for this course. It may have been removed or securely restricted.</p>
                <Button variant="outline" asChild>
                    <Link href="/hub/courses">Back to Courses</Link>
                </Button>
            </div>
        );
    }

    const lessonsList = course.attributes.lessons?.data || [];

    // Default mock progress if backend hasn't implemented this yet, ensuring first lesson is available
    const safeProgress = progress || {
        resumeLessonId: lessonsList.length > 0 ? lessonsList[0].id : undefined,
        lessonStatus: lessonsList.reduce((acc, lesson, index) => {
            acc[lesson.id] = index === 0 ? "in_progress" : "locked";
            return acc;
        }, {} as Record<number, "completed" | "in_progress" | "locked">)
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
            <Link href="/hub/courses" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
            </Link>

            <div className="space-y-4 pb-8 border-b border-border/40">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{course.attributes.title}</h1>
                <p className="text-lg text-muted-foreground">{course.attributes.description}</p>

                {safeProgress.resumeLessonId && (
                    <div className="flex items-center gap-4 mt-6">
                        <Button size="lg" className="bg-brand-cyan hover:bg-brand-cyan/90 text-primary-foreground font-semibold px-8" asChild>
                            <Link href={`/hub/courses/${params.slug}/lesson/${safeProgress.resumeLessonId}`}>
                                <PlayCircle className="mr-2 h-5 w-5" /> Resume Course
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            <div className="pt-4 space-y-4">
                <h2 className="text-xl font-semibold">Course Syllabus</h2>

                {lessonsList.length === 0 ? (
                    <div className="text-muted-foreground bg-muted/20 p-8 text-center rounded-lg border border-border/40">
                        Lessons are currently being developed for this course.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {lessonsList.map((lesson, index) => {
                            const status = safeProgress.lessonStatus[lesson.id] || "locked";

                            return (
                                <div key={lesson.id}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border gap-4 ${status === "in_progress" ? "border-brand-cyan/50 bg-brand-cyan/5 shadow-sm" : "border-border/60 bg-background"} transition-colors`}>

                                    <div className="flex items-center gap-4">
                                        <div className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full ${status === "completed" ? "bg-success/20 text-success" :
                                                status === "in_progress" ? "bg-brand-cyan/20 text-brand-cyan" :
                                                    "bg-muted text-muted-foreground"
                                            }`}>
                                            {status === "completed" ? <CheckCircle2 className="w-5 h-5" /> :
                                                status === "locked" ? <Lock className="w-4 h-4" /> :
                                                    <span className="text-sm font-bold">{index + 1}</span>}
                                        </div>
                                        <div>
                                            <h3 className={`font-medium leading-tight ${status === "locked" ? "text-muted-foreground" : "text-foreground"}`}>
                                                {lesson.attributes.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" /> {lesson.attributes.content_type || "Lesson"}
                                                </span>
                                                <span>•</span>
                                                <span>{lesson.attributes.estimated_minutes || 10} min</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button variant={status === "in_progress" ? "default" : "ghost"}
                                        size="sm"
                                        disabled={status === "locked"}
                                        className={status === "in_progress" ? "bg-brand-cyan hover:bg-brand-cyan/90 w-full sm:w-auto" : "w-full sm:w-auto"}
                                        asChild={status !== "locked"}>
                                        {status !== "locked" ? (
                                            <Link href={`/hub/courses/${params.slug}/lesson/${lesson.id}`}>
                                                {status === "completed" ? "Review" : "Start"}
                                            </Link>
                                        ) : (
                                            <span>Locked</span>
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
