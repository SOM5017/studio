import { Booking, BookingStatus, PaymentMethod } from '@/lib/types';
import { addDays, subDays } from 'date-fns';

let bookings: Booking[] = [
  {
    id: '1',
    startDate: subDays(new Date(), 5),
    endDate: subDays(new Date(), 3),
    fullName: 'John Doe',
    mobileNumber: '09171234567',
    numberOfGuests: 2,
    namesOfGuests: 'John Doe, Jane Doe',
    paymentMethod: 'gcash',
    status: 'confirmed',
    isFraudulent: false,
    fraudulentReason: '',
  },
  {
    id: '2',
    startDate: addDays(new Date(), 2),
    endDate: addDays(new Date(), 4),
    fullName: 'Jane Smith',
    mobileNumber: '09187654321',
    numberOfGuests: 1,
    namesOfGuests: 'Jane Smith',
    paymentMethod: 'cash',
    status: 'pending',
    isFraudulent: false,
    fraudulentReason: '',
  },
  {
    id: '3',
    startDate: addDays(new Date(), 10),
    endDate: addDays(new Date(), 11),
    fullName: 'Suspicious Booker',
    mobileNumber: '1234567890',
    numberOfGuests: 5,
    namesOfGuests: 'Guest 1, Guest 2, Guest 3, Guest 4, Guest 5',
    paymentMethod: 'cash',
    status: 'pending',
    isFraudulent: true,
    fraudulentReason: 'The provided mobile number appears to be invalid, and the booking was made for a large group with generic guest names, which is a common pattern for fraudulent reservations.',
  },
];

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
  return Promise.resolve(bookings);
}

export async function addBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
  const newBooking = { ...booking, id: Date.now().toString() };
  bookings.push(newBooking);
  return Promise.resolve(newBooking);
}

export async function updateBooking(id: string, updatedBooking: Partial<Booking>): Promise<Booking | null> {
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
        return null;
    }
    bookings[index] = { ...bookings[index], ...updatedBooking };
    return Promise.resolve(bookings[index]);
}

export async function deleteBooking(id: string): Promise<boolean> {
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
        return false;
    }
    bookings.splice(index, 1);
    return Promise.resolve(true);
}
