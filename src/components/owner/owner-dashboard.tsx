"use client";

import * as React from 'react';
import { Booking, BookingStatus } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isWithinInterval, startOfDay, eachDayOfInterval } from 'date-fns';
import { BookingDetailPanel } from './booking-detail-panel';
import { useToast } from '@/hooks/use-toast';
import { deleteBookingAction, updateBookingStatusAction } from '@/app/actions';

interface OwnerDashboardProps {
    initialBookings: Booking[];
}

const statusColors: Record<BookingStatus, string> = {
    pending: 'hsl(var(--accent))',
    confirmed: 'hsl(var(--primary))',
    cancelled: 'hsl(var(--destructive))',
};

export default function OwnerDashboard({ initialBookings }: OwnerDashboardProps) {
    const [bookings, setBookings] = React.useState(initialBookings);
    const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
    const [isPanelOpen, setPanelOpen] = React.useState(false);
    const { toast } = useToast();

    const bookingDays = bookings.flatMap(booking => {
        const days = eachDayOfInterval({
            start: startOfDay(new Date(booking.startDate)),
            end: startOfDay(new Date(booking.endDate))
        });
        return days.map(day => ({
            day,
            status: booking.status,
            bookingId: booking.id
        }));
    });

    const modifiers = bookingDays.reduce((acc, { day, status }) => {
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(day);
        return acc;
    }, {} as Record<BookingStatus, Date[]>);

    const modifierStyles = Object.keys(statusColors).reduce((acc, status) => {
        acc[status] = {
            color: 'hsl(var(--primary-foreground))',
            backgroundColor: statusColors[status as BookingStatus],
        };
        return acc;
    }, {} as Record<string, React.CSSProperties>);

    const handleDayClick = (day: Date) => {
        const bookingForDay = bookings.find(b =>
            isWithinInterval(startOfDay(day), {
                start: startOfDay(new Date(b.startDate)),
                end: startOfDay(new Date(b.endDate))
            })
        );
        if (bookingForDay) {
            setSelectedBooking(bookingForDay);
            setPanelOpen(true);
        }
    };

    const handleUpdateBooking = async (id: string, status: BookingStatus) => {
        const result = await updateBookingStatusAction(id, status);
        if (result.success && result.booking) {
            setBookings(bookings.map(b => b.id === id ? result.booking! : b));
            toast({ title: "Booking Updated", description: "The booking status has been successfully updated." });
            setPanelOpen(false);
        } else {
            toast({ variant: 'destructive', title: "Update Failed", description: result.error });
        }
    };

    const handleDeleteBooking = async (id: string) => {
        const result = await deleteBookingAction(id);
        if (result.success) {
            setBookings(bookings.filter(b => b.id !== id));
            toast({ title: "Booking Deleted", description: "The booking has been successfully removed." });
            setPanelOpen(false);
        } else {
            toast({ variant: 'destructive', title: "Deletion Failed", description: result.error });
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl">Owner Dashboard</CardTitle>
                    <CardDescription>View and manage all your bookings. Tap a date to see details.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="flex flex-wrap justify-center gap-4 text-sm mb-4">
                        {Object.entries(statusColors).map(([status, color]) => (
                            <div key={status} className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }}></span>
                                <span className="capitalize">{status}</span>
                            </div>
                        ))}
                    </div>
                    <Calendar
                        mode="single"
                        onDayClick={handleDayClick}
                        modifiers={modifiers}
                        modifierStyles={modifierStyles}
                        numberOfMonths={1}
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>

            {selectedBooking && (
                <BookingDetailPanel
                    booking={selectedBooking}
                    isOpen={isPanelOpen}
                    onOpenChange={setPanelOpen}
                    onUpdate={handleUpdateBooking}
                    onDelete={handleDeleteBooking}
                />
            )}
        </>
    );
}
