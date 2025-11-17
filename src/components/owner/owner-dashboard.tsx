
"use client";

import * as React from 'react';
import { Booking, BookingStatus } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isWithinInterval, startOfDay, format, addDays } from 'date-fns';
import { BookingDetailPanel } from './booking-detail-panel';
import { useToast } from '@/hooks/use-toast';
import { deleteBookingAction, updateBookingStatusAction } from '@/app/actions';
import { ChangeCredentialsForm } from './change-credentials-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ShieldCheck, List, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { getBookings } from '@/lib/data';

const statusBadgeVariants: Record<BookingStatus, "default" | "secondary" | "destructive"> = {
    pending: 'secondary',
    confirmed: 'default',
    cancelled: 'destructive'
}

interface OwnerDashboardProps {
    initialBookings: Booking[];
}

export default function OwnerDashboard({ initialBookings }: OwnerDashboardProps) {
    const [bookings, setBookings] = React.useState<Booking[]>(initialBookings);
    const [isLoading, setIsLoading] = React.useState(false);
    
    const { toast } = useToast();
    const router = useRouter();
    const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
    const [isPanelOpen, setPanelOpen] = React.useState(false);

    const refreshData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedBookings = await getBookings();
            setBookings(fetchedBookings);
            router.refresh(); // This re-fetches server components and their data
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not refresh bookings.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast, router]);
    

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

    const handleUpdateBooking = async (id: string, status: BookingStatus) => {
        const result = await updateBookingStatusAction(id, status);
        if (result.success) {
            toast({ title: "Booking Updated", description: "The booking status has been successfully updated." });
            setPanelOpen(false);
            await refreshData();
        } else {
            toast({ variant: 'destructive', title: "Update Failed", description: result.error });
        }
    };

    const handleDeleteBooking = async (id: string) => {
        const result = await deleteBookingAction(id);
        if (result.success) {
            toast({ title: "Booking Deleted", description: "The booking has been successfully removed." });
            setPanelOpen(false);
            await refreshData();
        } else {
            toast({ variant: 'destructive', title: "Deletion Failed", description: result.error });
        }
    };

    const sortedBookings = React.useMemo(() => {
        return [...bookings].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [bookings]);

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
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl md:text-3xl">Owner Dashboard</CardTitle>
                        <CardDescription>View and manage all your bookings. Click a date to see details if a booking exists for it.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        {isLoading && bookings.length === 0 ? (
                            <div className="rounded-md border p-3">
                                <div className="h-[298px] w-[280px] animate-pulse rounded-md bg-muted" />
                            </div>
                        ) : (
                            <Calendar
                                mode="single"
                                onDayClick={handleDayClick}
                                numberOfMonths={1}
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
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <List className="h-5 w-5" />
                                <CardTitle className="text-2xl">All Bookings</CardTitle>
                            </div>
                             <Button variant="outline" size="icon" onClick={refreshData} disabled={isLoading}>
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                <span className="sr-only">Refresh Bookings</span>
                            </Button>
                        </div>
                        <CardDescription>A complete list of all your bookings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && bookings.length > 0 ? (
                             <div className="flex justify-center items-center h-24">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Guest</TableHead>
                                        <TableHead>Check-in</TableHead>
                                        <TableHead>Check-out</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedBookings.length > 0 ? sortedBookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">{booking.fullName}</TableCell>
                                            <TableCell>{format(new Date(booking.startDate), 'PPP')}</TableCell>
                                            <TableCell>{format(new Date(booking.endDate), 'PPP')}</TableCell>
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
                                            <TableCell colSpan={5} className="text-center h-24">No bookings yet.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" />
                                <span className="text-lg font-semibold">Security Settings</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <Card>
                                <CardHeader>
                                    <CardTitle>Change Credentials</CardTitle>
                                    <CardDescription>Update your admin username and password.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChangeCredentialsForm />
                                </CardContent>
                           </Card>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </div>

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
