import Link from "next/link";
import { ArrowLeft, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";

interface StrapiLesson {
    data: {
        id: number;
        attributes: {
            title: string;
            content_type: string;
            reading_content?: string;
            video_url?: string;
            sequence_order: number;
        }
    }
}

interface LessonProgress {
    status: "completed" | "in_progress" | "locked";
    previousLessonId?: number;
    nextLessonId?: number;
    totalLessons: number;
}

async function fetchLessonContent(lessonId: string): Promise<StrapiLesson | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:1337";
        const res = await fetch(`${baseUrl}/api/lessons/${lessonId}`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function fetchLessonProgress(courseSlug: string, lessonId: string): Promise<LessonProgress | null> {
    const cookieStore = cookies();
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${baseUrl}/api/education/students/courses/${courseSlug}/lessons/${lessonId}/progress`, {
            credentials: "include",
            headers: {
                Cookie: cookieStore.toString()
            },
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null; // Fallback handled gracefully
    }
}

export default async function LessonPlayerPage({ params }: { params: { slug: string, lessonId: string } }) {
    const [lessonData, progressData] = await Promise.all([
        fetchLessonContent(params.lessonId),
        fetchLessonProgress(params.slug, params.lessonId)
    ]);

    if (!lessonData?.data) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-destructive/20 bg-destructive/10 animate-in fade-in max-w-2xl mx-auto mt-8">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h2 className="text-xl font-semibold text-destructive mb-2">Lesson Unavailable</h2>
                <p className="text-muted-foreground mb-6">We couldn&apos;t load the content for this lesson. It may have been removed or securely restricted.</p>
                <Button variant="outline" asChild>
                    <Link href={`/hub/courses/${params.slug}`}>Back to Syllabus</Link>
                </Button>
            </div>
        );
    }

    const { attributes } = lessonData.data;

    // Default safe mocks if backend is offline or unbuilt
    const safeProgress = progressData || {
        status: "in_progress",
        totalLessons: attributes.sequence_order || 1, // fallback
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <div className="flex items-center justify-between text-sm mb-6">
                <Link href={`/hub/courses/${params.slug}`} className="inline-flex items-center font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Syllabus
                </Link>
                <div className="text-muted-foreground hidden sm:block">
                    Lesson {attributes.sequence_order} of {safeProgress.totalLessons}
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {attributes.title}
                </h1>

                {/* Conditional Media Player */}
                {(attributes.content_type === "Video" || attributes.video_url) ? (
                    <div className="w-full aspect-video bg-black/90 rounded-xl overflow-hidden shadow-lg flex items-center justify-center relative border border-border/40">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="text-center z-10 space-y-4">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-cyan/20 text-brand-cyan ring-1 ring-brand-cyan/40 cursor-pointer hover:scale-105 transition-transform backdrop-blur-sm">
                                <span className="translate-x-0.5">▶</span>
                            </div>
                            <p className="text-white/80 font-medium text-sm">Video Player Component</p>
                            {attributes.video_url && (
                                <p className="text-xs text-white/50">{attributes.video_url}</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-4" />
                )}

                {/* Lesson text content (Rich Text from Strapi) */}
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-a:text-brand-cyan py-8">
                    {/* In a real app we'd map Markdown or ReactMarkdown, for now just rendering the raw string or a generic reading payload */}
                    {attributes.reading_content ? (
                        <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground break-words">
                            {attributes.reading_content}
                        </div>
                    ) : (
                        <p className="lead text-lg text-muted-foreground">
                            When a patient reports their tinnitus is most bothersome at night, specific sound therapy approaches are required to facilitate sleep onset without causing cortical arousal.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border/40 pb-12">
                <Button variant="outline" className="w-full sm:w-auto" disabled={!safeProgress.previousLessonId} asChild={!!safeProgress.previousLessonId}>
                    {safeProgress.previousLessonId ? (
                        <Link href={`/hub/courses/${params.slug}/lesson/${safeProgress.previousLessonId}`}>Previous Lesson</Link>
                    ) : (
                        <span>Previous Lesson</span>
                    )}
                </Button>

                {/* Take Quiz Action */}
                <Button className="w-full sm:w-auto bg-brand-cyan hover:bg-brand-cyan/90 text-primary-foreground gap-2 h-11 px-8" asChild>
                    <Link href={`/hub/courses/${params.slug}/quiz/q${params.lessonId}`}>
                        <HelpCircle className="h-4 w-4" /> Take Lesson Quiz
                    </Link>
                </Button>
            </div>
        </div>
    );
}
