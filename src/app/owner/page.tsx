import OwnerDashboard from "@/components/owner/owner-dashboard";
import { getBookings } from "@/lib/data";

export default async function OwnerPage() {
    const bookings = await getBookings();
    
    return (
        <div className="container mx-auto p-4 md:p-8">
            <OwnerDashboard initialBookings={bookings} />
        </div>
    );
}