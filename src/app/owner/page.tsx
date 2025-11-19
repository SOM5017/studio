
import { getSession } from "@/app/actions";
import OwnerDashboard from "@/components/owner/owner-dashboard";
import { redirect } from "next/navigation";

export default async function OwnerPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>
            <OwnerDashboard />
        </div>
    );
}
