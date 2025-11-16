import { Booking } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for bookings for the demo.
let bookings: Booking[] = [];

// In-memory store for credentials for the demo.
let credentials = {
    username: 'admin',
    password: 'admin',
};

// Functions to manage credentials
export function getCredentials() {
    return credentials;
}

export function setCredentials(newUsername?: string, newPassword?: string) {
    if (newUsername) {
        credentials.username = newUsername;
    }
    if (newPassword) {
        credentials.password = newPassword;
    }
}

// Functions to manage bookings in-memory
export async function getBookings(): Promise<Booking[]> {
    // Return a copy to prevent direct modification of the in-memory array
    return Promise.resolve([...bookings]);
}

export async function addBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const newBooking: Booking = {
        id: uuidv4(),
        ...booking,
    };
    bookings.push(newBooking);
    return Promise.resolve(newBooking);
}

export async function updateBooking(id: string, updatedBooking: Partial<Booking>): Promise<Booking | null> {
    const bookingIndex = bookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
        return Promise.resolve(null);
    }

    const bookingToUpdate = bookings[bookingIndex];
    const newBooking = { ...bookingToUpdate, ...updatedBooking };
    bookings[bookingIndex] = newBooking;
    
    return Promise.resolve(newBooking);
}

export async function deleteBooking(id: string): Promise<boolean> {
    const initialLength = bookings.length;
    bookings = bookings.filter(b => b.id !== id);
    return Promise.resolve(bookings.length < initialLength);
}
