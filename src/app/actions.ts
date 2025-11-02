"use server";

import { z } from 'zod';
import { addBooking, deleteBooking, updateBooking } from '@/lib/data';
import { Booking, BookingStatus, paymentMethods } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { detectFraudulentBookings, DetectFraudulentBookingsInput } from '@/ai/flows/detect-fraudulent-bookings';
import { format } from 'date-fns';

const bookingSchema = z.object({
  fullName: z.string().min(2),
  mobileNumber: z.string(),
  numberOfGuests: z.coerce.number().min(1),
  namesOfGuests: z.string().min(2),
  paymentMethod: z.enum(paymentMethods),
  startDate: z.date(),
  endDate: z.date(),
});

export async function createBookingAction(data: z.infer<typeof bookingSchema>) {
  const validation = bookingSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Invalid data provided." };
  }

  const { startDate, endDate, ...bookingData } = validation.data;

  // Prepare input for AI fraud detection
  const aiInput: DetectFraudulentBookingsInput = {
    durationOfStay: `${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}`,
    fullName: bookingData.fullName,
    mobileNumber: bookingData.mobileNumber,
    numberOfGuests: bookingData.numberOfGuests,
    namesOfGuests: bookingData.namesOfGuests,
    paymentMethod: bookingData.paymentMethod,
  };

  try {
    // Call fraud detection flow
    const fraudResult = await detectFraudulentBookings(aiInput);

    const newBookingData: Omit<Booking, 'id'> = {
      ...bookingData,
      startDate,
      endDate,
      status: 'pending',
      isFraudulent: fraudResult.isFraudulent,
      fraudulentReason: fraudResult.fraudulentReason,
    };

    const newBooking = await addBooking(newBookingData);
    
    revalidatePath('/');
    revalidatePath('/owner');

    return { success: true, booking: newBooking };

  } catch (error) {
    console.error("Error creating booking or detecting fraud:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function updateBookingStatusAction(id: string, status: BookingStatus) {
    try {
        const updated = await updateBooking(id, { status });
        if (!updated) {
            return { success: false, error: 'Booking not found.' };
        }
        revalidatePath('/owner');
        revalidatePath('/');
        return { success: true, booking: updated };
    } catch(error) {
        return { success: false, error: 'Failed to update booking.' };
    }
}

export async function deleteBookingAction(id: string) {
    try {
        const success = await deleteBooking(id);
        if (!success) {
            return { success: false, error: 'Booking not found.' };
        }
        revalidatePath('/owner');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete booking.' };
    }
}
