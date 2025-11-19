
'use client';

import OwnerDashboard from "@/components/owner/owner-dashboard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Loader2 } from "lucide-react";

export default function OwnerPage() {
    const auth = useAuth();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
        }
    }, [user, isAuthLoading, router]);

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!user) {
        return null; // Render nothing while redirecting
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>
            <OwnerDashboard />
        </div>
    );
}
