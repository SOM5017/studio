
"use client";

import { Booking } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get bookings from localStorage
const getStoredBookings = (): Booking[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    const stored = window.localStorage.getItem('bookings');
    return stored ? JSON.parse(stored) : [];
};

// Helper function to set bookings in localStorage
const setStoredBookings = (bookings: Booking[]): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('bookings', JSON.stringify(bookings));
    }
};

// This function now fetches bookings from localStorage.
// It is NOT async and must be called on the client side.
export function getBookings(): Booking[] {
    return getStoredBookings();
}

// This function now adds a booking to localStorage.
export function addBooking(booking: Omit<Booking, 'id'>): Booking {
    const bookings = getStoredBookings();
    const newBooking: Booking = {
        id: uuidv4(),
        ...booking,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    
    const updatedBookings = [...bookings, newBooking];
    setStoredBookings(updatedBookings);
    
    return newBooking;
}

// This function now updates a booking in localStorage.
export function updateBooking(id: string, updatedBooking: Partial<Booking>): Booking | null {
    const bookings = getStoredBookings();
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
        return null;
    }

    const originalBooking = bookings[bookingIndex];
    const newBooking = {
        ...originalBooking,
        ...updatedBooking,
        updatedAt: new Date().toISOString(),
    };

    bookings[bookingIndex] = newBooking;
    setStoredBookings(bookings);

    return newBooking;
}

// This function now deletes a booking from localStorage.
export function deleteBooking(id: string): boolean {
    const bookings = getStoredBookings();
    const initialLength = bookings.length;
    
    const updatedBookings = bookings.filter(b => b.id !== id);
    
    if (updatedBookings.length < initialLength) {
        setStoredBookings(updatedBookings);
        return true;
    }
    
    return false;
}
