"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [university, setUniversity] = useState("");
    const [studentId, setStudentId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

            // Step 1: Create auth user
            const authRes = await fetch(`${baseUrl}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password, roles: ["student"] }),
            });

            if (!authRes.ok) {
                const data = await authRes.json().catch(() => null);
                throw new Error(data?.message ?? "Registration failed. Email might already be in use.");
            }

            // Step 2: Create student profile using the newly set auth cookies
            const profileRes = await fetch(`${baseUrl}/api/education/students/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    university,
                    studentIdNumber: studentId
                }),
            });

            if (!profileRes.ok) {
                const data = await profileRes.json().catch(() => null);
                throw new Error(data?.message ?? "Failed to create student profile.");
            }

            // On success, redirect to the Hub
            router.push("/hub");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute inset-0 -z-10 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
                <div className="absolute inset-0 rounded-full bg-brand-cyan/20 blur-[100px]" />
            </div>

            <div className="w-full max-w-md my-8 flex flex-col items-center gap-4">
                <Link href="/" className="flex flex-col items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt="AudiologyLink"
                        width={48}
                        height={48}
                        className="rounded-xl shadow-md"
                    />
                    <div className="text-center">
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            AudiologyLink <span className="text-brand-cyan">Education Hub</span>
                        </h1>
                    </div>
                </Link>

                <Card className="w-full shadow-lg border-border/60">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl">Student Registration</CardTitle>
                        <CardDescription>Join the premier clinical education platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">Account Details</h3>

                                <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@university.edu.ng"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Create a strong password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border/40">
                                <h3 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">Verification Details</h3>

                                <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="university">University</Label>
                                        <Input
                                            id="university"
                                            placeholder="e.g. FUHSI, Unilorin, Uniben"
                                            value={university}
                                            onChange={(e) => setUniversity(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="studentId">Student ID Number / Matric Number</Label>
                                        <Input
                                            id="studentId"
                                            placeholder="Your official student registration number"
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-md border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full mt-2 bg-brand-cyan hover:bg-brand-cyan/90 text-primary-foreground font-semibold h-11" disabled={loading}>
                                {loading ? "Creating account..." : "Register & Join Hub"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-border/40 bg-muted/20 py-4">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold text-brand-cyan hover:underline">
                                Sign in here
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
