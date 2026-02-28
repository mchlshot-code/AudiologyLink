import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, Clock, Trophy, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

interface DashboardProgress {
    coursesInProgress: number;
    completedModules: number;
    avgQuizScore: number;
    inProgressCourse?: {
        courseSlug: string;
        lessonId: string;
        progressPercentage: number;
    } | null;
    recentAchievements: Array<{
        id: string;
        title: string;
        description: string;
    }>;
}

interface StrapiCourse {
    id: number;
    attributes: {
        title: string;
        lessons?: {
            data: Array<{
                id: number;
                attributes: {
                    title: string;
                }
            }>;
        };
    };
}

// Fetch user's clinical progress and status from the NestJS backend
async function fetchProgressData(): Promise<{ data: DashboardProgress | null, error: boolean }> {
    const cookieStore = cookies();
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${baseUrl}/api/education/students/dashboard`, {
            credentials: "include", // For cookie-based auth forwarding
            headers: {
                Cookie: cookieStore.toString()
            },
            cache: 'no-store' // Never cache personal dashboard data
        });

        if (!res.ok) {
            console.error(`Backend returned ${res.status}`);
            return { data: null, error: true };
        }

        const data = await res.json();
        return { data, error: false };
    } catch (err) {
        console.error("Error fetching progress from backend:", err);
        return { data: null, error: true };
    }
}

// Fetch the rich CMS data for the specific course the user is working on
async function fetchCourseDetails(slug: string): Promise<StrapiCourse | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:1337";
        // Fetch course by slug, populate lessons to get the current lesson title
        const res = await fetch(`${baseUrl}/api/courses?filters[slug][$eq]=${slug}&populate=lessons`, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) return null;

        const json = await res.json();
        return json.data[0] || null; // Return the first matching course
    } catch (err) {
        console.error("Error fetching course details from Strapi:", err);
        return null;
    }
}

export default async function HubDashboardPage() {
    const { data: progress, error: progressError } = await fetchProgressData();

    // If there is an in-progress course, fetch its metadata from Strapi
    let courseDetails: StrapiCourse | null = null;
    if (progress?.inProgressCourse) {
        courseDetails = await fetchCourseDetails(progress.inProgressCourse.courseSlug);
    }

    if (progressError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-destructive/20 bg-destructive/10 animate-in fade-in duration-500">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h2 className="text-xl font-semibold text-destructive mb-2">Could not load dashboard</h2>
                <p className="text-muted-foreground max-w-md">
                    We were unable to securely connect to your profile. Please check your connection or try signing in again.
                </p>
                <Button variant="outline" className="mt-6" asChild>
                    <Link href="/">Return to Home</Link>
                </Button>
            </div>
        );
    }

    // Default safe fallback if backend returned empty but no error
    const metrics = progress || {
        coursesInProgress: 0,
        completedModules: 0,
        avgQuizScore: 0,
        recentAchievements: []
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
                <p className="text-muted-foreground mt-1">Pick up where you left off and track your clinical progress.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 text-center">
                <Card className="bg-background shadow-xs border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Courses in Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{metrics.coursesInProgress}</div>
                    </CardContent>
                </Card>
                <Card className="bg-background shadow-xs border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completed Modules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-success/80">{metrics.completedModules}</div>
                    </CardContent>
                </Card>
                <Card className="bg-background shadow-xs border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Quiz Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-brand-cyan">{metrics.avgQuizScore}%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="text-xl font-semibold tracking-tight">Continue Learning</h2>

                {!progress?.inProgressCourse || !courseDetails ? (
                    <Card className="border-border/60 shadow-sm p-8 text-center bg-muted/20">
                        <div className="mx-auto bg-background h-12 w-12 rounded-full flex items-center justify-center mb-4 ring-1 ring-border">
                            <PlayCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold mb-1">No active courses</h3>
                        <p className="text-sm text-muted-foreground mb-4">Start exploring the course catalogue to find your next clinical challenge.</p>
                        <Button variant="outline" asChild>
                            <Link href="/hub/courses">Browse Courses</Link>
                        </Button>
                    </Card>
                ) : (
                    <Card className="flex flex-col md:flex-row overflow-hidden border-border/60 shadow-sm relative group bg-background">
                        <div className="w-2 absolute inset-y-0 left-0 bg-brand-cyan/60" />

                        <div className="flex-1 p-6 pl-8">
                            <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan mb-2 uppercase tracking-wide">
                                <Clock className="w-3.5 h-3.5" /> Continue Module
                            </div>
                            <h3 className="text-xl font-bold mb-1">{courseDetails.attributes.title}</h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-xl">
                                You are currently on Lesson {progress.inProgressCourse.lessonId}.
                            </p>

                            <div className="flex items-center gap-4 text-sm font-medium">
                                <span className="text-muted-foreground w-12">{progress.inProgressCourse.progressPercentage}%</span>
                                <Progress value={progress.inProgressCourse.progressPercentage} className="w-full max-w-sm h-2 [&>div]:bg-brand-cyan" />
                            </div>
                        </div>

                        <div className="p-6 flex items-center justify-end bg-muted/10 border-t md:border-t-0 md:border-l border-border/40">
                            <Button className="gap-2 bg-brand-cyan hover:bg-brand-cyan/90 text-primary-foreground min-w-[140px]" asChild>
                                <Link href={`/hub/courses/${progress.inProgressCourse.courseSlug}/lesson/${progress.inProgressCourse.lessonId}`}>
                                    <PlayCircle className="w-4 h-4" /> Resume
                                </Link>
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="text-xl font-semibold tracking-tight">Recent Achievements</h2>
                {metrics.recentAchievements.length === 0 ? (
                    <Card className="border-border/60 p-6 text-center text-muted-foreground text-sm bg-muted/20">
                        Complete lessons and pass quizzes to earn clinical achievements.
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {metrics.recentAchievements.map((achievement) => (
                            <Card key={achievement.id} className="border-border/60">
                                <div className="p-4 flex items-center gap-4">
                                    <div className="bg-success/10 text-success p-3 rounded-full">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
