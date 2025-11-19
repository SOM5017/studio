'use client';

import { Booking } from '@/lib/types';
import {
  collection,
  doc,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase/non-blocking-updates';

export function getBookingsCollection(db: Firestore) {
  return collection(db, 'bookings');
}

export function getBookingDoc(db: Firestore, id: string) {
    return doc(db, 'bookings', id);
}

export function addBooking(db: Firestore, booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) {
  const bookingsCollection = getBookingsCollection(db);
  const newBooking = {
    ...booking,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  return addDocumentNonBlocking(bookingsCollection, newBooking);
}

export function updateBooking(db: Firestore, id: string, updatedBooking: Partial<Booking>) {
  const bookingDoc = getBookingDoc(db, id);
  const newBookingData = {
    ...updatedBooking,
    updatedAt: serverTimestamp(),
  };
  updateDocumentNonBlocking(bookingDoc, newBookingData);
}

export function deleteBooking(db: Firestore, id: string) {
    const bookingDoc = getBookingDoc(db, id);
    deleteDocumentNonBlocking(bookingDoc);
}
