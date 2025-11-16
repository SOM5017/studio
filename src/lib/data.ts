
import { Booking } from '@/lib/types';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/firebase/config';

const db = getFirestore(app);

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
  try {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    const bookings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
        } as Booking;
    });
    return bookings;
  } catch (error) {
    console.error("Failed to read bookings:", error);
    throw error;
  }
}

export async function addBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    try {
        const docRef = await addDoc(collection(db, "bookings"), booking);
        return { ...booking, id: docRef.id };
    } catch (error) {
        console.error("Error adding booking: ", error);
        throw error;
    }
}

export async function updateBooking(id: string, updatedBooking: Partial<Booking>): Promise<Booking | null> {
    try {
        const bookingRef = doc(db, "bookings", id);
        await updateDoc(bookingRef, updatedBooking);
        const bookings = await getBookings();
        return bookings.find(b => b.id === id) || null;
    } catch (error) {
        console.error("Error updating booking: ", error);
        throw error;
    }
}

export async function deleteBooking(id: string): Promise<boolean> {
    try {
        await deleteDoc(doc(db, "bookings", id));
        return true;
    } catch (error) {
        console.error("Error deleting booking: ", error);
        return false;
    }
}
