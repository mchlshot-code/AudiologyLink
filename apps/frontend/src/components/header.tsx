"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar } from "@/components/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";

const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/patients": "Patients",
    "/appointments": "Appointments",
    "/clinicians": "Clinicians",
    "/settings": "Settings",
};

function getInitials(email: string): string {
    const name = email.split("@")[0] ?? "";
    return name.slice(0, 2).toUpperCase();
}

export function Header() {
    const pathname = usePathname();
    const title = pageTitles[pathname] ?? "AudiologyLink";
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="flex h-14 items-center gap-4 px-4 md:px-6">
                <MobileSidebar />
                <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
                <div className="ml-auto flex items-center gap-3">
                    {user && (
                        <>
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium leading-none">
                                    {user.email}
                                </span>
                                <span className="text-xs text-muted-foreground capitalize">
                                    {user.roles[0] ?? "user"}
                                </span>
                            </div>
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                    {getInitials(user.email)}
                                </AvatarFallback>
                            </Avatar>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

