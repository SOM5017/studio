
"use client";

import * as React from 'react';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay, addDays } from 'date-fns';
import { Booking } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookingForm, BookingFormValues } from './booking-form';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Loader2, PartyPopper, RefreshCw } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useRouter } from 'next/navigation';
import { getBookings, addBooking } from '@/lib/data';

export default function BookingFlow() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = React.useState(true);
  
  const [range, setRange] = React.useState<DateRange | undefined>();
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = React.useState(false);
  const [newBooking, setNewBooking] = React.useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [disabledDays, setDisabledDays] = React.useState<(Date | { before: Date })[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const fetchBookings = React.useCallback(() => {
    setIsLoadingBookings(true);
    try {
      const fetchedBookings = getBookings();
      setBookings(fetchedBookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load existing bookings.',
      });
    } finally {
      setIsLoadingBookings(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  
  React.useEffect(() => {
    const today = new Date();
    
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

    const unavailableDates = confirmedBookings.reduce((acc: Date[], booking) => {
      const a = booking.startDate;
      const b = booking.endDate;

      if (a && b) {
          const interval = { start: startOfDay(new Date(a)), end: startOfDay(new Date(b)) };
          let currentDate = interval.start;
          while(currentDate <= interval.end) {
              acc.push(new Date(currentDate));
              currentDate = addDays(currentDate, 1);
          }
      }
      return acc;
    }, []);

    setDisabledDays([{ before: today }, ...unavailableDates]);
  }, [bookings]);

  const handleBookingSubmit = (values: BookingFormValues) => {
    if (!range?.from || !range?.to) return;
    setIsSubmitting(true);
    try {
      const newBookingData: Omit<Booking, 'id'> = {
        ...values,
        startDate: range.from.toISOString(),
        endDate: range.to.toISOString(),
        status: 'pending',
        isFraudulent: false,
        fraudulentReason: '',
      };
      
      const createdBooking = addBooking(newBookingData);

      setNewBooking(createdBooking);
      setFormOpen(false);
      setConfirmationOpen(true);
      fetchBookings(); 
      router.refresh(); 

    } catch (error) {
        console.error("Booking submission error:", error);
        toast({
            variant: 'destructive',
            title: 'An Error Occurred',
            description: 'Something went wrong. Please try again.',
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setFormOpen(false);
      setConfirmationOpen(false);
      setRange(undefined);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl md:text-3xl">Book Your Stay</CardTitle>
              <CardDescription>Select your desired dates on the calendar. Unavailable dates are crossed out.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={fetchBookings} disabled={isLoadingBookings}>
              <RefreshCw className={`h-4 w-4 ${isLoadingBookings ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh Availability</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {isLoadingBookings && !bookings.length ? (
            <div className="rounded-md border p-3">
              <div className="h-[298px] w-[280px] animate-pulse rounded-md bg-muted" />
            </div>
          ) : (
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={1}
              disabled={disabledDays}
              modifiers={{ unavailable: disabledDays.filter(d => d instanceof Date) as Date[] }}
              modifiersClassNames={{ unavailable: "day-unavailable" }}
              className="rounded-md border"
            />
          )}
          <Button
            onClick={() => setFormOpen(true)}
            disabled={!range?.from || !range?.to || isLoadingBookings || isSubmitting}
            size="lg"
            className="w-full sm:w-auto"
          >
            Book Now
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {range && (
            <BookingForm
              range={range}
              onSubmit={handleBookingSubmit}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmationOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
            <ScrollArea className="max-h-[80vh]">
                <div className="p-1">
                    <DialogHeader className="items-center text-center">
                        <PartyPopper className="h-12 w-12 text-accent" />
                        <DialogTitle className="text-2xl">Booking Requested!</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                        <p>
                        Thank you, <span className="font-semibold text-foreground">{newBooking?.fullName}</span>! Your booking request has been received. Please follow the payment instructions below to confirm your stay.
                        </p>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div><strong>Check-in:</strong> {newBooking?.startDate ? new Date(newBooking.startDate).toLocaleDateString() : ''}</div>
                                <div><strong>Check-out:</strong> {newBooking?.endDate ? new Date(newBooking.endDate).toLocaleDateString() : ''}</div>
                                <div><strong>Guests:</strong> {newBooking?.numberOfGuests}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Payment Instructions</CardTitle>
                            </CardHeader>
                            <CardContent>
                            {newBooking?.paymentMethod === 'gcash' ? (
                                <div className="space-y-3">
                                <p>Please send your payment via GCash to the number or QR code below. Once paid, send a screenshot of your receipt to the owner to confirm your booking.</p>
                                <div className="font-mono p-3 bg-secondary rounded-md text-center">
                                    <p className="font-semibold">0912 345 6789</p>
                                    <p className="text-xs">(Juan Dela Cruz)</p>
                                </div>
                                <div className="flex justify-center">
                                    <Image 
                                        src={PlaceHolderImages.find(img => img.id === 'gcash-qr')?.imageUrl ?? ''} 
                                        alt="GCash QR Code" 
                                        width={200}
                                        height={200}
                                        data-ai-hint="qr code"
                                        className="rounded-lg"
                                    />
                                </div>
                                </div>
                            ) : (
                                <div>
                                <p>Please contact the owner at <span className="font-semibold text-foreground">0912 345 6789</span> to arrange your cash payment.</p>
                                </div>
                            )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button onClick={() => handleDialogClose(false)}>Close</Button>
                    </div>
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
