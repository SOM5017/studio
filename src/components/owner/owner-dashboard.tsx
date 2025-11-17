
"use client";

import * as React from 'react';
import { Booking } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isWithinInterval, startOfDay, addDays } from 'date-fns';
import { BookingDetailPanel } from './booking-detail-panel';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { subscribe, updateBooking, deleteBooking } from '@/lib/data';
import { StatsCards } from './stats-cards';
import { BookingsChart } from './bookings-chart';
import { BookingsTable } from './bookings-table';
import { Loader2 } from 'lucide-react';

export default function OwnerDashboard() {
    const [bookings, setBookings] = React.useState<Booking[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    
    const { toast } = useToast();
    const router = useRouter();
    const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
    const [isPanelOpen, setPanelOpen] = React.useState(false);

    React.useEffect(() => {
        const unsubscribe = subscribe((newBookings) => {
            setBookings(newBookings);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDayClick = (day: Date) => {
        const bookingForDay = bookings.find(b =>
            b.status !== 'cancelled' &&
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

    const handleSelectBooking = (booking: Booking) => {
        setSelectedBooking(booking);
        setPanelOpen(true);
    };

    const handleUpdateBooking = (id: string, status: any) => {
        const result = updateBooking(id, { status });
        if (result) {
            toast({ title: "Booking Updated", description: "The booking status has been successfully updated." });
            setPanelOpen(false);
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: "Update Failed", description: "Booking not found." });
        }
    };

    const handleDeleteBooking = (id: string) => {
        const result = deleteBooking(id);
        if (result) {
            toast({ title: "Booking Deleted", description: "The booking has been successfully removed." });
            setPanelOpen(false);
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: "Deletion Failed", description: "Booking not found." });
        }
    };

    const bookedDays = React.useMemo(() => {
        return bookings.reduce((acc: { pending: Date[], confirmed: Date[] }, booking) => {
            if (booking.status === 'cancelled') return acc;
            
            const startDate = startOfDay(new Date(booking.startDate));
            const endDate = startOfDay(new Date(booking.endDate));
            let currentDate = startDate;

            while(currentDate <= endDate) {
                if(booking.status === 'pending') {
                    acc.pending.push(new Date(currentDate));
                } else if (booking.status === 'confirmed') {
                    acc.confirmed.push(new Date(currentDate));
                }
                currentDate = addDays(currentDate, 1);
            }
            
            return acc;
        }, { pending: [], confirmed: [] });
    }, [bookings]);
    
    return (
        <>
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    <StatsCards bookings={bookings} />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4">
                            <CardHeader>
                                <CardTitle>Bookings Overview</CardTitle>
                                <CardDescription>A chart showing your recent booking trends.</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                               <BookingsChart bookings={bookings} />
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Booking Calendar</CardTitle>
                                <CardDescription>Click a date to see booking details.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    onDayClick={handleDayClick}
                                    className="rounded-md border"
                                    modifiers={{ 
                                        pending: bookedDays.pending,
                                        confirmed: bookedDays.confirmed 
                                    }}
                                    modifiersClassNames={{
                                        pending: "bg-accent text-accent-foreground",
                                        confirmed: "bg-primary text-primary-foreground",
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                    <BookingsTable bookings={bookings} onSelectBooking={handleSelectBooking} />
                </div>
            )}

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
