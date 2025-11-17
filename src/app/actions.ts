
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
// We can't use the data functions directly in server actions anymore
// as they rely on client-side localStorage.
// The logic will be handled on the client. We keep these actions
// for potential future use or to maintain the structure.

// This schema validates the complete booking object.
const bookingActionSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  mobileNumber: z.string().regex(/^(09|\+639)\d{9}$/, { message: 'Please enter a valid PH mobile number.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
  numberOfGuests: z.coerce.number().min(1, { message: 'At least one guest is required.' }),
  namesOfGuests: z.string().min(2, { message: 'Please list the names of the guests.' }),
  paymentMethod: z.enum(['gcash', 'cash'], { required_error: 'Please select a payment method.' }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});


// NOTE: createBookingAction is no longer the primary mechanism for creating bookings
// due to the shift to localStorage. The logic is now in booking-flow.tsx.
// This server action remains as a placeholder.
export async function createBookingAction(data: unknown) {
  const validation = bookingActionSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: "Invalid data provided." };
  }
  
  // In a real DB scenario, this is where you'd call your database service.
  // Since we're using localStorage, the actual data creation happens on the client.
  // We'll just revalidate paths here.
  
  revalidatePath('/');
  revalidatePath('/owner');

  return { success: true, bookingData: validation.data };
}

// Similarly, these actions will revalidate paths, but the core logic
// is now triggered on the client side.
export async function updateBookingStatusAction(id: string, status: string) {
    revalidatePath('/owner');
    revalidatePath('/');
    return { success: true };
}

export async function deleteBookingAction(id: string) {
    revalidatePath('/owner');
    revalidatePath('/');
    return { success: true };
}
