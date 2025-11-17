import { Booking } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// This is our in-memory "database".
// It's a simple array that will be reset every time the server restarts.
let bookings: Booking[] = [];

// This function now fetches bookings from the in-memory array.
export async function getBookings(): Promise<Booking[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50)); 
    // Return a copy to prevent direct mutation of the array
    return JSON.parse(JSON.stringify(bookings));
}

// This function now adds a booking to the in-memory array.
export async function addBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const newBooking: Booking = {
        id: uuidv4(), // Generate a unique ID
        ...booking,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    
    bookings.push(newBooking);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));
    return JSON.parse(JSON.stringify(newBooking));
}

// This function now updates a booking in the in-memory array.
export async function updateBooking(id: string, updatedBooking: Partial<Booking>): Promise<Booking | null> {
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
        return null; // Booking not found
    }

    const originalBooking = bookings[bookingIndex];
    const newBooking = {
        ...originalBooking,
        ...updatedBooking,
        updatedAt: new Date().toISOString(),
    };

    bookings[bookingIndex] = newBooking;

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));
    return JSON.parse(JSON.stringify(newBooking));
}

// This function now deletes a booking from the in-memory array.
export async function deleteBooking(id: string): Promise<boolean> {
    const initialLength = bookings.length;
    bookings = bookings.filter(b => b.id !== id);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));
    // Return true if an item was removed, false otherwise
    return bookings.length < initialLength;
}

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
