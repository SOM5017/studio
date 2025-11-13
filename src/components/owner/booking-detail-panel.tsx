"use client";

import { useState } from 'react';
import { Booking, BookingStatus, bookingStatuses } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

interface BookingDetailPanelProps {
  booking: Booking;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, status: BookingStatus) => void;
  onDelete: (id: string) => void;
}

export function BookingDetailPanel({
  booking,
  isOpen,
  onOpenChange,
  onUpdate,
  onDelete,
}: BookingDetailPanelProps) {
  const [newStatus, setNewStatus] = useState<BookingStatus>(booking.status);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] flex flex-col">
        <SheetHeader>
          <SheetTitle>Booking Details</SheetTitle>
          <SheetDescription>
            For {booking.fullName} - From {format(new Date(booking.startDate), 'PPP')} to {format(new Date(booking.endDate), 'PPP')}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex-grow overflow-y-auto pr-6 space-y-4 text-sm">
          {booking.isFraudulent && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Potential Fraud Detected!</AlertTitle>
              <AlertDescription>{booking.fraudulentReason}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-foreground">Full Name</p>
              <p>{booking.fullName}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Mobile Number</p>
              <p>{booking.mobileNumber}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Number of Guests</p>
              <p>{booking.numberOfGuests}</p>
            </div>
             <div>
              <p className="font-medium text-foreground">Payment Method</p>
              <p className="capitalize">{booking.paymentMethod}</p>
            </div>
          </div>
          <div>
            <p className="font-medium text-foreground">Address</p>
            <p className="whitespace-pre-wrap">{booking.address}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Guest Names</p>
            <p className="whitespace-pre-wrap">{booking.namesOfGuests}</p>
          </div>

          <Separator className="my-4" />
          
          <div>
            <p className="font-medium text-foreground mb-2">Update Status</p>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as BookingStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Change status..." />
              </SelectTrigger>
              <SelectContent>
                {bookingStatuses.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter className="mt-auto pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Booking</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the booking for {booking.fullName}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(booking.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex-grow"></div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onUpdate(booking.id, newStatus)}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
