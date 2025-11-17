import OwnerDashboard from "@/components/owner/owner-dashboard";
import { getBookings } from "@/lib/data";

export const dynamic = 'force-dynamic';

export default async function OwnerPage() {
    const bookings = await getBookings();
    
    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>
            <OwnerDashboard initialBookings={bookings} />
        </div>
    );
}
