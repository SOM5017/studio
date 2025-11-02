import BookingFlow from '@/components/customer/booking-flow';
import { getBookings } from '@/lib/data';

export default async function Home() {
  const bookings = await getBookings();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <BookingFlow bookings={bookings} />
    </div>
  );
}
