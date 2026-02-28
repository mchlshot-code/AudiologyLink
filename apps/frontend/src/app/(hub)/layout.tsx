import Link from "next/link";
import Image from "next/image";
import { LogOut, BookOpen, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HubLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-col hidden md:flex border-r border-border/40 bg-background/80 backdrop-blur-md">
                <div className="h-16 flex items-center px-6 border-b border-border/40">
                    <Link href="/hub" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-md" />
                        <span className="font-semibold tracking-tight text-foreground">
                            Student Hub
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-3 bg-brand-cyan/10 text-brand-cyan" asChild>
                        <Link href="/hub">
                            <BarChart3 className="h-4 w-4" /> Dashboard
                        </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted" asChild>
                        <Link href="/hub/courses">
                            <BookOpen className="h-4 w-4" /> My Courses
                        </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted" asChild>
                        <Link href="/hub/settings">
                            <Settings className="h-4 w-4" /> Profile & Settings
                        </Link>
                    </Button>
                </nav>

                <div className="p-4 border-t border-border/40">
                    <form action="/api/auth/logout" method="POST">
                        <Button type="submit" variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <LogOut className="h-4 w-4" /> Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 flex items-center px-6 border-b border-border/40 bg-background md:hidden">
                    <Link href="/hub" className="font-semibold tracking-tight text-foreground">Student Hub</Link>
                </header>
                <div className="p-6 md:p-8 flex-1 max-w-5xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
