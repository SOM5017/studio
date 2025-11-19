
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
        // Only perform redirection after the initial user loading is complete.
        if (!isUserLoading && !user) {
            router.replace('/login');
        }
    }, [user, isUserLoading, router]);

    // Show loading indicator while Firebase is checking the auth state.
    if (isUserLoading) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
            </div>
        );
    }

    // If loading is complete and we have a user, show the dashboard.
    // If there's no user, this will be null for a moment before the useEffect redirects.
    if (user) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>
                <OwnerDashboard />
            </div>
        );
    }
    
    // Fallback for the brief moment before redirection occurs.
    // This state is hit when isUserLoading is false but user is null.
    // The useEffect will then trigger the redirect to '/login'.
    return (
        <div className="flex h-full w-full flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
    );
}
