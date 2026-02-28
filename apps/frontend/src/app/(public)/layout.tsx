import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Public Navbar */}
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
                <nav className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4 md:px-6">
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <Image
                            src="/logo.png"
                            alt="AudiologyLink"
                            width={34}
                            height={34}
                            className="rounded-md shadow-sm"
                        />
                        <span className="text-base font-semibold tracking-tight text-foreground">
                            AudiologyLink <span className="text-brand-cyan/80 font-normal">| Education</span>
                        </span>
                    </Link>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/courses" className="hover:text-foreground transition-colors">
                            Courses
                        </Link>
                        <Link href="/resources" className="hover:text-foreground transition-colors">
                            Free Resources
                        </Link>
                    </div>

                    {/* Authentication / CTA */}
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                            <Link href="/login">Sign in</Link>
                        </Button>
                        <Button asChild size="sm" className="bg-brand-cyan hover:bg-brand-cyan/90 text-primary-foreground">
                            <Link href="/register">Join the Hub</Link>
                        </Button>
                    </div>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-border/50 bg-muted/20 py-10 mt-12 text-center text-xs text-muted-foreground">
                <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="font-medium text-foreground/80">© {new Date().getFullYear()} AudiologyLink.</p>
                    <div className="flex gap-4">
                        <Link href="/courses" className="hover:text-foreground transition-colors">Courses</Link>
                        <Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link>
                        <Link href="/login" className="hover:text-foreground transition-colors">Student Login</Link>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 max-w-xs text-right">
                        Empowering the next generation of Nigerian audiologists.
                    </p>
                </div>
            </footer>
        </div>
    );
}
