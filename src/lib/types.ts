
export const bookingStatuses = ['pending', 'confirmed', 'cancelled'] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export const paymentMethods = ['gcash', 'cash'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export interface Booking {
  id: string;
  startDate: string; // Stored as ISO string
  endDate: string; // Stored as ISO string
  fullName: string;
  mobileNumber: string;
  address: string;
  numberOfGuests: number;
  namesOfGuests: string;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  isFraudulent: boolean;
  fraudulentReason: string;
  createdAt?: any; // Firestore ServerTimestamp
  updatedAt?: any; // Firestore ServerTimestamp
}
