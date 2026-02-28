import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { Stethoscope } from "lucide-react";

export default function CliniciansPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Clinicians</h2>
                <p className="text-muted-foreground text-sm">
                    View and manage clinician profiles and assignments.
                </p>
            </div>

            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-success/10 p-4 mb-4">
                        <Stethoscope className="h-8 w-8 text-success" />
                    </div>
                    <CardTitle className="text-lg mb-1">No clinicians yet</CardTitle>
                    <CardDescription className="max-w-sm">
                        The Clinicians module is coming soon. You'll be able to manage
                        clinician profiles, specializations, and availability here.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
