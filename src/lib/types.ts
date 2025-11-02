export const bookingStatuses = ['pending', 'confirmed', 'cancelled'] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export const paymentMethods = ['gcash', 'cash'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export interface Booking {
  id: string;
  startDate: Date;
  endDate: Date;
  fullName: string;
  mobileNumber: string;
  numberOfGuests: number;
  namesOfGuests: string;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  isFraudulent: boolean;
  fraudulentReason: string;
}
