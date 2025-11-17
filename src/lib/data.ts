
"use client";

import { Booking } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

let bookings: Booking[] = [];
type Listener = (bookings: Booking[]) => void;
let listeners: Listener[] = [];

// Helper function to get bookings from localStorage, only run once
const getInitialBookings = (): Booking[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    const stored = window.localStorage.getItem('bookings');
    bookings = stored ? JSON.parse(stored) : [];
    return bookings;
};

// Initialize bookings on script load in the browser
if (typeof window !== 'undefined') {
    getInitialBookings();
}

// Helper function to set bookings in localStorage and notify listeners
const updateAndNotify = (newBookings: Booking[]): void => {
    bookings = newBookings;
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('bookings', JSON.stringify(bookings));
    }
    listeners.forEach(listener => listener(bookings));
};

export const subscribe = (listener: Listener): (() => void) => {
    listeners.push(listener);
    // Provide the initial data immediately
    listener(bookings);
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
};

export function getBookings(): Booking[] {
    return bookings;
}

export function addBooking(booking: Omit<Booking, 'id'>): Booking {
    const newBooking: Booking = {
        id: uuidv4(),
        ...booking,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    
    const updatedBookings = [...bookings, newBooking];
    updateAndNotify(updatedBookings);
    
    return newBooking;
}

export function updateBooking(id: string, updatedBooking: Partial<Booking>): Booking | null {
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

    const updatedBookings = [...bookings];
    updatedBookings[bookingIndex] = newBooking;
    updateAndNotify(updatedBookings);

    return newBooking;
}

export function deleteBooking(id: string): boolean {
    const initialLength = bookings.length;
    
    const updatedBookings = bookings.filter(b => b.id !== id);
    
    if (updatedBookings.length < initialLength) {
        updateAndNotify(updatedBookings);
        return true;
    }
    
    return false;
}
