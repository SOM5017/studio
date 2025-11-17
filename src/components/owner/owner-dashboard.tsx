
"use client";

import * as React from 'react';
import { Booking, BookingStatus } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isWithinInterval, startOfDay, addDays, format } from 'date-fns';
import { BookingDetailPanel } from './booking-detail-panel';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { subscribe, updateBooking, deleteBooking } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Loader2, List } from 'lucide-react';

const statusBadgeVariants: Record<BookingStatus, "default" | "secondary" | "destructive"> = {
    pending: 'secondary',
    confirmed: 'default',
    cancelled: 'destructive'
}

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

     const sortedBookings = [...bookings].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    return (
        <>
            {isLoading ? (
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card>
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
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                     <List className="h-5 w-5" />
                                    <CardTitle>All Bookings</CardTitle>
                                </div>
                                <CardDescription>A list of all bookings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Guest</TableHead>
                                            <TableHead>Check-in</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedBookings.length > 0 ? sortedBookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-medium">{booking.fullName}</TableCell>
                                                <TableCell>{format(new Date(booking.startDate), 'PPP')}</TableCell>
                                                <TableCell>
                                                    <Badge variant={statusBadgeVariants[booking.status]} className="capitalize">
                                                        {booking.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => handleSelectBooking(booking)}>
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">No bookings yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
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
