"use client";

import * as React from 'react';
import { Booking, BookingStatus } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isWithinInterval, startOfDay, eachDayOfInterval, format } from 'date-fns';
import { BookingDetailPanel } from './booking-detail-panel';
import { useToast } from '@/hooks/use-toast';
import { deleteBookingAction, updateBookingStatusAction } from '@/app/actions';
import { ChangeCredentialsForm } from './change-credentials-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ShieldCheck, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface OwnerDashboardProps {
    bookings: Booking[];
}

const statusBadgeVariants: Record<BookingStatus, "default" | "secondary" | "destructive"> = {
    pending: 'secondary',
    confirmed: 'default',
    cancelled: 'destructive'
}

export default function OwnerDashboard({ bookings: initialBookings }: OwnerDashboardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [bookings, setBookings] = React.useState(initialBookings);
    const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
    const [isPanelOpen, setPanelOpen] = React.useState(false);

    React.useEffect(() => {
        setBookings(initialBookings);
    }, [initialBookings]);

    const bookingDays = bookings
        .filter(b => b.status !== 'cancelled')
        .flatMap(booking => {
            if (!booking.startDate || !booking.endDate) return [];
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

    const modifiers: Record<string, Date[]> = bookingDays.reduce((acc, { day, status }) => {
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(day);
        return acc;
    }, {} as Record<string, Date[]>);

    const modifierStyles: Record<string, React.CSSProperties> = {
        pending: { 
            backgroundColor: 'hsl(48 95% 60%)', 
            color: 'hsl(48 95% 20%)',
        },
        confirmed: { 
            backgroundColor: 'hsl(209 90% 65%)',
            color: 'hsl(210 40% 98%)',
        },
    };
    
    const statusColors: Record<string, string> = {
        pending: modifierStyles.pending.backgroundColor,
        confirmed: modifierStyles.confirmed.backgroundColor,
    };


    const handleDayClick = (day: Date) => {
        const bookingForDay = bookings.find(b =>
            b.status !== 'cancelled' &&
            b.startDate && b.endDate &&
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
        if (result.success && result.booking) {
            toast({ title: "Booking Updated", description: "The booking status has been successfully updated." });
            setPanelOpen(false);
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: "Update Failed", description: result.error });
        }
    };

    const handleDeleteBooking = async (id: string) => {
        const result = await deleteBookingAction(id);
        if (result.success) {
            toast({ title: "Booking Deleted", description: "The booking has been successfully removed." });
            setPanelOpen(false);
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: "Deletion Failed", description: result.error });
        }
    };

    const sortedBookings = React.useMemo(() => 
        [...bookings].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [bookings]);

    return (
        <>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl md:text-3xl">Owner Dashboard</CardTitle>
                        <CardDescription>View and manage all your bookings. Click a colored date to see details.</CardDescription>
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
                
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <List className="h-5 w-5" />
                            <CardTitle className="text-2xl">All Bookings</CardTitle>
                        </div>
                        <CardDescription>A complete list of all your bookings.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
