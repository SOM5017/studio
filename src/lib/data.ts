
import { Booking } from '@/lib/types';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getFirestore, Timestamp, Firestore } from 'firebase/firestore';
import { app } from '@/firebase/config';

let db: Firestore;
if (app) {
    db = getFirestore(app);
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
  if (!db) {
    console.log("Firestore is not initialized.");
    return [];
  }
  try {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    const bookings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure Timestamps are converted to Dates
        const startDate = data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date(data.startDate);
        const endDate = data.endDate instanceof Timestamp ? data.endDate.toDate() : new Date(data.endDate);
        
        return {
            id: doc.id,
            ...data,
            startDate,
            endDate,
        } as Booking;
    });
    return bookings;
  } catch (error) {
    console.error("Failed to read bookings:", error);
    // In case of error, return an empty array to prevent app crashes
    return [];
  }
}

export async function addBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    if (!db) {
        throw new Error("Firestore is not initialized.");
    }
    try {
        const bookingWithTimestamps = {
            ...booking,
            startDate: Timestamp.fromDate(new Date(booking.startDate)),
            endDate: Timestamp.fromDate(new Date(booking.endDate)),
        };
        const docRef = await addDoc(collection(db, "bookings"), bookingWithTimestamps);
        return { ...booking, id: docRef.id };
    } catch (error) {
        console.error("Error adding booking: ", error);
        throw error;
    }
}

export async function updateBooking(id: string, updatedBooking: Partial<Booking>): Promise<Booking | null> {
    if (!db) {
        throw new Error("Firestore is not initialized.");
    }
    try {
        const bookingRef = doc(db, "bookings", id);
        
        const updateData: any = { ...updatedBooking };

        if (updatedBooking.startDate) {
            updateData.startDate = Timestamp.fromDate(new Date(updatedBooking.startDate));
        }
        if (updatedBooking.endDate) {
            updateData.endDate = Timestamp.fromDate(new Date(updatedBooking.endDate));
        }

        await updateDoc(bookingRef, updateData);
        
        // This is inefficient, but getBookings() is simple. For a real app, you'd getDoc(bookingRef).
        const bookings = await getBookings(); 
        return bookings.find(b => b.id === id) || null;
    } catch (error) {
        console.error("Error updating booking: ", error);
        throw error;
    }
}

export async function deleteBooking(id: string): Promise<boolean> {
    if (!db) {
        throw new Error("Firestore is not initialized.");
    }
    try {
        await deleteDoc(doc(db, "bookings", id));
        return true;
    } catch (error) {
        console.error("Error deleting booking: ", error);
        return false;
    }
}
