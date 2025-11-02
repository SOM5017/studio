
import { Booking } from '@/lib/types';
import fs from 'node:fs/promises';
import path from 'node:path';

// Use a JSON file as a simple database for the demo.
// In a real application, you would use a proper database like Firestore, PostgreSQL, etc.
const DB_PATH = path.join(process.cwd(), 'src/lib/bookings.json');

async function readBookings(): Promise<Booking[]> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const bookings = JSON.parse(data);
    // Dates are stored as strings in JSON, so we need to convert them back to Date objects.
    return bookings.map((booking: any) => ({
      ...booking,
      startDate: new Date(booking.startDate),
      endDate: new Date(booking.endDate),
    }));
  } catch (error) {
    // If the file doesn't exist, return an empty array.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error("Failed to read bookings:", error);
    throw error;
  }
}

async function writeBookings(bookings: Booking[]): Promise<void> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to write bookings:", error);
    throw error;
  }
}

// In-memory store for credentials for the demo.
let credentials = {
    username: 'admin',
    password: 'admin',
};

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

export async function getBookings(): Promise<Booking[]> {
  return readBookings();
}

export async function addBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
  const bookings = await readBookings();
  const newBooking = { ...booking, id: Date.now().toString() };
  bookings.push(newBooking);
  await writeBookings(bookings);
  return newBooking;
}

export async function updateBooking(id: string, updatedBooking: Partial<Booking>): Promise<Booking | null> {
    const bookings = await readBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
        return null;
    }
    bookings[index] = { ...bookings[index], ...updatedBooking };
    await writeBookings(bookings);
    // Find the updated booking again to return it with the correct Date objects
    const updatedBookings = await readBookings();
    return updatedBookings.find(b => b.id === id) || null;
}

export async function deleteBooking(id: string): Promise<boolean> {
    let bookings = await readBookings();
    const initialLength = bookings.length;
    bookings = bookings.filter(b => b.id !== id);
    if (bookings.length === initialLength) {
        return false;
    }
    await writeBookings(bookings);
    return true;
}
