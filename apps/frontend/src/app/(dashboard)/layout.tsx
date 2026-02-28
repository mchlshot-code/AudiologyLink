import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthProvider } from "@/components/auth-provider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-background">
                <Sidebar />
                <div className="md:pl-64 flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 p-4 md:p-6">{children}</main>
                </div>
            </div>
        </AuthProvider>
    );
}
