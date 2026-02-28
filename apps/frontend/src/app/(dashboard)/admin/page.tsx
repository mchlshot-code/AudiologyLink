import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { GraduationCap, BookOpen, Activity } from "lucide-react";

type ClinicStatus = {
    clinicId: string;
    name: string;
    status: "open" | "closed";
    updatedAt: string;
};

async function getClinicStatus(): Promise<ClinicStatus | null> {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
        const response = await fetch(`${baseUrl}/api/clinic-status`, {
            cache: "no-store",
        });
        if (!response.ok) return null;
        return response.json();
    } catch {
        return null;
    }
}

const statCards = [
    {
        title: "Enrolled Students",
        value: "—",
        description: "Coming soon",
        icon: GraduationCap,
        color: "text-primary",
    },
    {
        title: "Active Courses",
        value: "—",
        description: "Coming soon",
        icon: BookOpen,
        color: "text-brand-cyan",
    },
];

export default async function DashboardPage() {
    const status = await getClinicStatus();

    return (
        <div className="flex flex-col gap-6">
            {/* Welcome banner */}
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                    Welcome back
                </h2>
                <p className="text-muted-foreground text-sm">
                    Here&apos;s an overview of the Education Hub.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((card) => (
                    <Card key={card.title} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{card.value}</p>
                            <CardDescription className="text-xs">
                                {card.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Clinic Status */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-brand-cyan" />
                                Clinic Status
                            </CardTitle>
                            <CardDescription>
                                Live status from the backend API
                            </CardDescription>
                        </div>
                        {status && (
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${status.status === "open"
                                    ? "bg-success/10 text-success"
                                    : "bg-destructive/10 text-destructive"
                                    }`}
                            >
                                {status.status.toUpperCase()}
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {status ? (
                        <div className="grid gap-3 sm:grid-cols-3 text-sm">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Name
                                </p>
                                <p className="font-medium">{status.name}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Clinic ID
                                </p>
                                <p className="font-medium">{status.clinicId}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Last Updated
                                </p>
                                <p className="font-medium">
                                    {new Date(status.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Unable to reach backend. Make sure the API is running on port 3001.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
