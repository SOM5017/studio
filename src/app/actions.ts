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

const bookingSchema = z.object({
  fullName: z.string().min(2),
  mobileNumber: z.string(),
  address: z.string().min(5),
  numberOfGuests: z.coerce.number().min(1),
  namesOfGuests: z.string().min(2),
  paymentMethod: z.enum(paymentMethods),
  startDate: z.date(),
  endDate: z.date(),
});

export async function createBookingAction(data: z.infer<typeof bookingSchema>) {
  const validation = bookingSchema.safeParse(data);
  if (!validation.success) {
    // This should ideally not happen with client-side validation
    return { success: false, error: "Invalid data provided." };
  }

  const { startDate, endDate, ...bookingData } = validation.data;

  // Prepare input for AI fraud detection
  const aiInput: DetectFraudulentBookingsInput = {
    durationOfStay: `${format(new Date(startDate), 'PPP')} to ${format(new Date(endDate), 'PPP')}`,
    fullName: bookingData.fullName,
    mobileNumber: bookingData.mobileNumber,
    address: bookingData.address,
    numberOfGuests: bookingData.numberOfGuests,
    namesOfGuests: bookingData.namesOfGuests,
    paymentMethod: bookingData.paymentMethod,
  };

  try {
    // Call fraud detection flow
    const fraudResult = await detectFraudulentBookings(aiInput);

    const newBookingData: Omit<Booking, 'id'> = {
      ...bookingData,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
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
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-chars');
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
