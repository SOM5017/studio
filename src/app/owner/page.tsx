
"use client";

import OwnerDashboard from "@/components/owner/owner-dashboard";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function OwnerPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        // If the user check is complete and there's no user, redirect to login.
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    // While we're checking for the user, show a loading state.
    if (isUserLoading || !user) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
            </div>
        );
    }
    
    // If we have a user, show the dashboard.
    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>
            <OwnerDashboard />
        </div>
    );
}
