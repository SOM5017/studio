
"use client";

import OwnerDashboard from "@/components/owner/owner-dashboard";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function OwnerPage() {
    // We keep useUser to handle potential logout, but remove the redirect logic.
    const { user, isUserLoading } = useUser();

    // The redirect logic is removed.
    // useEffect(() => {
    //     if (!isUserLoading && !user) {
    //         router.replace('/login');
    //     }
    // }, [user, isUserLoading, router]);

    // We can show a loading spinner while firebase checks the auth state,
    // but we will render the dashboard regardless.
    if (isUserLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>
            <OwnerDashboard />
        </div>
    );
}
