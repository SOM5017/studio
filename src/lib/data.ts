import { promises as fs } from 'fs';
import path from 'path';
import { Booking } from '@/lib/types';

// In-memory store for credentials for the demo.
let credentials = {
    username: 'admin',
    password: 'admin',
};

// Path to the bookings data file
const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'bookings.json');

async function readData(): Promise<Booking[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const bookings = JSON.parse(fileContent);
    // When reading from JSON, dates are strings, so we need to convert them back to Date objects.
    return bookings.map((booking: any) => ({
      ...booking,
      startDate: new Date(booking.startDate),
      endDate: new Date(booking.endDate),
    }));
  } catch (error) {
    // If the file does not exist, return an empty array.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read bookings:', error);
    // In case of other errors, return an empty array to prevent app crashes
    return [];
  }
}

async function writeData(data: Booking[]): Promise<void> {
  try {
    // Dates will be converted to ISO strings during JSON serialization, which is fine.
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to write bookings:', error);
    throw new Error('Could not write to data file.');
  }
}

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
    return await readData();
}

export async function addBooking(booking: Booking): Promise<Booking> {
    const bookings = await readData();
    bookings.push(booking);
    await writeData(bookings);
    return booking;
}

export async function updateBooking(id: string, updatedBooking: Partial<Booking>): Promise<Booking | null> {
    const bookings = await readData();
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
        return null;
    }

    const bookingToUpdate = bookings[bookingIndex];
    const newBooking = { ...bookingToUpdate, ...updatedBooking };
    bookings[bookingIndex] = newBooking;

    await writeData(bookings);
    return newBooking;
}

export async function deleteBooking(id: string): Promise<boolean> {
    let bookings = await readData();
    const initialLength = bookings.length;
    bookings = bookings.filter(b => b.id !== id);

    if (bookings.length < initialLength) {
        await writeData(bookings);
        return true;
    }
    return false;
}