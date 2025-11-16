import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  where,
  query,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Booking } from '@/lib/types';

// In-memory store for credentials for the demo.
let credentials = {
    username: 'admin',
    password: 'admin',
};

// Reference to the 'bookings' collection in Firestore
const bookingsCollectionRef = collection(db, 'bookings');

async function readData(): Promise<Booking[]> {
  try {
    const querySnapshot = await getDocs(bookingsCollectionRef);
    const bookings = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to JS Date objects
        startDate: (data.startDate as Timestamp).toDate(),
        endDate: (data.endDate as Timestamp).toDate(),
      } as Booking;
    });
    return bookings;
  } catch (error) {
    console.error('Failed to read bookings:', error);
    // In case of errors, return an empty array to prevent app crashes
    return [];
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

export async function addBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const docRef = await addDoc(bookingsCollectionRef, {
        ...booking,
        startDate: Timestamp.fromDate(booking.startDate),
        endDate: Timestamp.fromDate(booking.endDate),
    });
    return { id: docRef.id, ...booking };
}

export async function updateBooking(id: string, updatedBooking: Partial<Booking>): Promise<Booking | null> {
    const docRef = doc(db, 'bookings', id);
    
    // Firestore does not allow updating a document that doesn't exist.
    // We can't easily get the updated doc back without another read,
    // so we'll just apply the update. For this app's purpose, we'll assume it succeeds.
    
    const updateData = { ...updatedBooking };
    if (updatedBooking.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(updatedBooking.startDate));
    }
    if (updatedBooking.endDate) {
        updateData.endDate = Timestamp.fromDate(new Date(updatedBooking.endDate));
    }

    await updateDoc(docRef, updateData);
    
    // To match the previous return type, we can construct a representation
    // of the updated booking. Note: this doesn't fetch the current state from DB.
    // A full implementation might re-fetch the document.
    const bookings = await readData();
    return bookings.find(b => b.id === id) || null;
}

export async function deleteBooking(id: string): Promise<boolean> {
    try {
        const docRef = doc(db, 'bookings', id);
        await deleteDoc(docRef);
        return true;
    } catch(error) {
        console.error("Error deleting booking: ", error);
        return false;
    }
}
