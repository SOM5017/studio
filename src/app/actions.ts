
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';

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

const secretKey = process.env.SESSION_SECRET || "your-secret-key-for-development";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function loginAction(prevState: any, formData: FormData) {
    const username = formData.get('username');
    const password = formData.get('password');

    if (username === 'admin' && password === 'admin') {
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        const session = await encrypt({ user: { username: 'admin' }, expires });
        cookies().set('session', session, { httpOnly: true, expires });
        return { success: true };
    }

    return { error: 'Invalid username or password' };
}

export async function logoutAction() {
    cookies().set('session', '', { expires: new Date(0) });
    redirect('/');
}

export async function getSession() {
    const session = cookies().get('session')?.value;
    if (!session) return null;
    return await decrypt(session);
}
