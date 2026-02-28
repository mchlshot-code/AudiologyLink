import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function AppointmentsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Appointments</h2>
                <p className="text-muted-foreground text-sm">
                    Schedule and manage clinic appointments.
                </p>
            </div>

            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-brand-cyan/10 p-4 mb-4">
                        <CalendarDays className="h-8 w-8 text-brand-cyan" />
                    </div>
                    <CardTitle className="text-lg mb-1">No appointments yet</CardTitle>
                    <CardDescription className="max-w-sm">
                        The Appointments module is coming soon. You&apos;ll be able to schedule
                        visits, manage time slots, and send reminders here.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
