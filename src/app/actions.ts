
"use server";

import { z } from 'zod';
import { addBooking, deleteBooking, updateBooking } from '@/lib/data';
import { Booking, BookingStatus, paymentMethods } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// This schema validates the complete booking object that the action will receive.
const bookingActionSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  mobileNumber: z.string().regex(/^(09|\+639)\d{9}$/, { message: 'Please enter a valid PH mobile number.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
  numberOfGuests: z.coerce.number().min(1, { message: 'At least one guest is required.' }),
  namesOfGuests: z.string().min(2, { message: 'Please list the names of the guests.' }),
  paymentMethod: z.enum(paymentMethods, { required_error: 'Please select a payment method.' }),
  // Dates are received as strings and coerced to Date objects for validation.
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});


export async function createBookingAction(data: unknown) {
  const validation = bookingActionSchema.safeParse(data);

  if (!validation.success) {
    console.error("Booking validation failed:", validation.error.flatten().fieldErrors);
    return { success: false, error: "Invalid data provided." };
  }

  const { startDate, endDate, ...bookingData } = validation.data;

  try {
    const newBookingData: Omit<Booking, 'id'> = {
      ...bookingData,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'pending',
      isFraudulent: false,
      fraudulentReason: '',
    };

    const newBooking = await addBooking(newBookingData);

    revalidatePath('/');
    revalidatePath('/owner');

    return { success: true, booking: newBooking };

  } catch (error) {
    console.error("Error creating booking:", error);
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
