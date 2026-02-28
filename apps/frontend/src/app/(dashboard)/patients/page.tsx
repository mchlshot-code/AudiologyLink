import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

export default function PatientsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Patients</h2>
                <p className="text-muted-foreground text-sm">
                    Manage patient records and clinical data.
                </p>
            </div>

            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg mb-1">No patients yet</CardTitle>
                    <CardDescription className="max-w-sm">
                        The Patients module is coming soon. You'll be able to manage patient
                        records, view clinical history, and track appointments here.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
