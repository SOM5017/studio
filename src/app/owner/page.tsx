
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
        // This effect runs only when the loading state is finished.
        // It prevents any redirection logic from running while Firebase is still checking auth.
        if (!isUserLoading && !user) {
            router.replace('/login');
        }
    }, [user, isUserLoading, router]);

    // STATE 1: Authentication is in progress.
    // Show a loading indicator and do nothing else. This is the key to preventing the loop.
    if (isUserLoading) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
            </div>
        );
    }

    // STATE 2: Loading is complete, and we have a user.
    // Show the protected dashboard content.
    if (user) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>
                <OwnerDashboard />
            </div>
        );
    }
    
    // STATE 3: Loading is complete, but there is no user.
    // The useEffect above will handle the redirection. In the meantime,
    // show a redirecting message to avoid a flash of unstyled content.
    return (
        <div className="flex h-full w-full flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
    );
}
