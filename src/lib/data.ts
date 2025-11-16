import { Booking } from '@/lib/types';
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    serverTimestamp,
    query,
    orderBy,
    getFirestore,
    DocumentData
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// This function now fetches bookings from Firestore.
// It is intended to be called from Server Components.
export async function getBookings(): Promise<Booking[]> {
    const { firestore } = initializeFirebase();
    const bookingsCol = collection(firestore, 'bookings');
    const q = query(bookingsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const bookings: Booking[] = [];
    snapshot.forEach(doc => {
        const data = doc.data() as DocumentData;
        bookings.push({
            id: doc.id,
            startDate: data.startDate,
            endDate: data.endDate,
            fullName: data.fullName,
            mobileNumber: data.mobileNumber,
            address: data.address,
            numberOfGuests: data.numberOfGuests,
            namesOfGuests: data.namesOfGuests,
            paymentMethod: data.paymentMethod,
            status: data.status,
            isFraudulent: data.isFraudulent,
            fraudulentReason: data.fraudulentReason
        });
    });

    return bookings;
}

// This function now adds a booking to Firestore.
// It is intended to be called from Server Actions.
export async function addBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const { firestore } = initializeFirebase();
    const bookingsCol = collection(firestore, 'bookings');
    
    const docData = {
        ...booking,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    
    // We use the non-blocking version and get the promise
    const docRefPromise = addDocumentNonBlocking(bookingsCol, docData);
    
    // We can await the promise here to get the docRef and return the full new booking object
    const docRef = await docRefPromise;

    return {
        id: docRef.id,
        ...booking,
    };
}

// This function now updates a booking in Firestore.
// It is intended to be called from Server Actions.
export async function updateBooking(id: string, updatedBooking: Partial<Booking>): Promise<Booking | null> {
    const { firestore } = initializeFirebase();
    const bookingDoc = doc(firestore, 'bookings', id);

    const updateData = {
        ...updatedBooking,
        updatedAt: serverTimestamp(),
    };

    updateDocumentNonBlocking(bookingDoc, updateData);
    
    // Optimistically return the updated data.
    // A more robust solution might re-fetch the data.
    const optimisticData = { ...updateData, id } as Booking;
    return Promise.resolve(optimisticData);
}

// This function now deletes a booking from Firestore.
// It is intended to be called from Server Actions.
export async function deleteBooking(id: string): Promise<boolean> {
    const { firestore } = initializeFirebase();
    const bookingDoc = doc(firestore, 'bookings', id);
    
    deleteDocumentNonBlocking(bookingDoc);
    
    // Optimistically return true
    return Promise.resolve(true);
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
