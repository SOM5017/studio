
"use server";

import { z } from 'zod';
import { addBooking, deleteBooking, updateBooking, getCredentials, setCredentials } from '@/lib/data';
import { Booking, BookingStatus, paymentMethods } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { detectFraudulentBookings, DetectFraudulentBookingsInput } from '@/ai/flows/detect-fraudulent-bookings';
import { format } from 'date-fns';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Schema for the form data ONLY
const bookingFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  mobileNumber: z.string().regex(/^(09|\+639)\d{9}$/, { message: 'Please enter a valid PH mobile number.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
  numberOfGuests: z.coerce.number().min(1, { message: 'At least one guest is required.' }),
  namesOfGuests: z.string().min(2, { message: 'Please list the names of the guests.' }),
  paymentMethod: z.enum(paymentMethods, { required_error: 'Please select a payment method.' }),
});

// Combined schema for the action, including dates
const bookingActionSchema = bookingFormSchema.extend({
  startDate: z.date(),
  endDate: z.date(),
});


export async function createBookingAction(data: z.infer<typeof bookingActionSchema>) {
  const validation = bookingActionSchema.safeParse(data);
  if (!validation.success) {
    // This should ideally not happen with client-side validation, but it's a good safeguard.
    console.error("Booking validation failed:", validation.error.flatten().fieldErrors);
    return { success: false, error: "Invalid data provided." };
  }

  const { startDate, endDate, ...bookingData } = validation.data;

  // Prepare input for AI fraud detection
  const aiInput: DetectFraudulentBookingsInput = {
    durationOfStay: `${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}`,
    ...bookingData
  };

  try {
    // Call fraud detection flow
    const fraudResult = await detectFraudulentBookings(aiInput);

    // This is the complete object that matches Omit<Booking, 'id'>
    const newBookingData: Omit<Booking, 'id'> = {
      ...bookingData,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'pending', // Set initial status
      isFraudulent: fraudResult.isFraudulent,
      fraudulentReason: fraudResult.fraudulentReason,
    };
    
    // addBooking expects the full object
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


const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
});

export async function loginAction(prevState: any, data: FormData) {
    const validation = loginSchema.safeParse(Object.fromEntries(data));
    if (!validation.success) {
        return { success: false, error: "Invalid data" };
    }

    const { username, password } = validation.data;
    const credentials = getCredentials();

    if (username === credentials.username && password === credentials.password) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ username, role: 'admin' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(secret);

        cookies().set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60, // 1 hour
            path: '/',
        });

        redirect('/owner');
    }

    return { success: false, error: "Invalid username or password" };
}

export async function logoutAction() {
    cookies().delete('session');
    redirect('/login');
}

const changeCredentialsSchema = z.object({
  newUsername: z.string().min(1),
  newPassword: z.string().min(1),
});

export async function changeCredentialsAction(data: z.infer<typeof changeCredentialsSchema>) {
  const validation = changeCredentialsSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Invalid data provided." };
  }
  
  try {
    setCredentials(validation.data.newUsername, validation.data.newPassword);
    // In a real app, you might want to force a re-login here
    // for now we just update and let the existing session continue until it expires.
    // To force re-login, we could delete the cookie:
    // cookies().delete('session');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update credentials." };
  }
}
