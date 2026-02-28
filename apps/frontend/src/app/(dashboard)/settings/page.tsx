import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
                <p className="text-muted-foreground text-sm">
                    Manage your clinic and account settings.
                </p>
            </div>

            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <Settings className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg mb-1">Settings</CardTitle>
                    <CardDescription className="max-w-sm">
                        Clinic configuration, user management, and system preferences will
                        be available here.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
