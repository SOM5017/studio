
"use client";

import * as React from 'react';
import { Booking, BookingStatus } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isWithinInterval, startOfDay, addDays, format, isValid } from 'date-fns';
import { BookingDetailPanel } from './booking-detail-panel';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { updateBooking, deleteBooking, getBookingsCollection } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Loader2, List, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChangeCredentialsForm } from './change-credentials-form';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';

const statusBadgeVariants: Record<BookingStatus, "default" | "secondary" | "destructive"> = {
    pending: 'secondary',
    confirmed: 'default',
    cancelled: 'destructive'
}

export default function OwnerDashboard() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    
    // Redirect if not logged in
    React.useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const bookingsCollection = useMemoFirebase(() => firestore ? getBookingsCollection(firestore) : null, [firestore]);
    const { data: bookings, isLoading: isBookingsLoading } = useCollection<Booking>(bookingsCollection);

    const { toast } = useToast();
    const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
    const [isPanelOpen, setPanelOpen] = React.useState(false);

    const handleDayClick = (day: Date) => {
        const bookingForDay = bookings?.find(b =>
            b.status !== 'cancelled' &&
            isValid(new Date(b.startDate)) && isValid(new Date(b.endDate)) &&
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

    const handleUpdateBooking = (id: string, status: BookingStatus) => {
        if (!firestore) return;
        updateBooking(firestore, id, { status });
        toast({ title: "Booking Updated", description: "The booking status has been successfully updated." });
        setPanelOpen(false);
    };

    const handleDeleteBooking = (id: string) => {
        if (!firestore) return;
        deleteBooking(firestore, id);
        toast({ title: "Booking Deleted", description: "The booking has been successfully removed." });
        setPanelOpen(false);
    };

    const bookedDays = React.useMemo(() => {
        return bookings?.reduce((acc: { pending: Date[], confirmed: Date[] }, booking) => {
            if (booking.status === 'cancelled' || !booking.startDate || !booking.endDate) return acc;
            
            const startDate = startOfDay(new Date(booking.startDate));
            const endDate = startOfDay(new Date(booking.endDate));

            if (!isValid(startDate) || !isValid(endDate)) return acc;

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
        }, { pending: [], confirmed: [] }) ?? { pending: [], confirmed: [] };
    }, [bookings]);

    const sortedBookings = React.useMemo(() => {
        if (!bookings) return [];
        return [...bookings].sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
            const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
            return dateB - dateA;
        });
    }, [bookings]);

    const isLoading = isUserLoading || isBookingsLoading;

    if (isLoading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <>
            <Tabs defaultValue="bookings">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bookings"><List />Bookings</TabsTrigger>
                    <TabsTrigger value="settings"><Settings />Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="bookings">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
                                                    <TableCell>{booking.startDate ? format(new Date(booking.startDate), 'PPP') : 'N/A'}</TableCell>
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
                </TabsContent>
                <TabsContent value="settings">
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>Update your administrator credentials.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChangeCredentialsForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

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
