"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    Stethoscope,
    Settings,
    LogOut,
    Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Patients", href: "/patients", icon: Users },
    { label: "Appointments", href: "/appointments", icon: CalendarDays },
    { label: "Clinicians", href: "/clinicians", icon: Stethoscope },
    { label: "Settings", href: "/settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={`
              flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
              transition-colors duration-150
              ${isActive
                                ? "bg-sidebar-accent text-brand-cyan"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            }
            `}
                    >
                        <item.icon className="h-4.5 w-4.5 shrink-0" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

function LogoutButton() {
    const { logout } = useAuth();

    return (
        <button
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
            <LogOut className="h-4.5 w-4.5" />
            Logout
        </button>
    );
}

/** Desktop sidebar — always visible on md+ */
export function Sidebar() {
    return (
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-sidebar border-r border-sidebar-border z-30">
            {/* Logo */}
            <div className="flex items-center gap-2 px-5 py-5">
                <Image
                    src="/logo.png"
                    alt="AudiologyLink"
                    width={36}
                    height={36}
                    className="rounded-md"
                />
                <span className="text-base font-semibold text-sidebar-foreground tracking-tight">
                    AudiologyLink
                </span>
            </div>

            <Separator className="bg-sidebar-border" />

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-4">
                <NavLinks />
            </div>

            {/* Footer */}
            <div className="px-3 pb-4">
                <Separator className="bg-sidebar-border mb-3" />
                <LogoutButton />
            </div>
        </aside>
    );
}

/** Mobile sidebar — sheet triggered by hamburger */
export function MobileSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-foreground"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                {/* Logo */}
                <div className="flex items-center justify-between px-5 py-5">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="AudiologyLink"
                            width={32}
                            height={32}
                            className="rounded-md"
                        />
                        <span className="text-base font-semibold text-sidebar-foreground tracking-tight">
                            AudiologyLink
                        </span>
                    </div>
                </div>

                <Separator className="bg-sidebar-border" />

                <div className="flex-1 py-4">
                    <NavLinks onNavigate={() => setOpen(false)} />
                </div>

                <div className="px-3 pb-4">
                    <Separator className="bg-sidebar-border mb-3" />
                    <LogoutButton />
                </div>
            </SheetContent>
        </Sheet>
    );
}
