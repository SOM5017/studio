
"use client";

import OwnerDashboard from "@/components/owner/owner-dashboard";

export default function OwnerPage() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>
            <OwnerDashboard />
        </div>
    );
}
