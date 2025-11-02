"use client";

import * as React from 'react';
import { Booking, BookingStatus } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isWithinInterval, startOfDay, eachDayOfInterval } from 'date-fns';
import { BookingDetailPanel } from './booking-detail-panel';
import { useToast } from '@/hooks/use-toast';
import { deleteBookingAction, updateBookingStatusAction } from '@/app/actions';
import { ChangeCredentialsForm } from './change-credentials-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OwnerDashboardProps {
    bookings: Booking[];
}

const statusColors: Record<BookingStatus, string> = {
    pending: 'hsl(var(--accent))',
    confirmed: 'hsl(var(--primary))',
    cancelled: 'hsl(var(--destructive))',
};

export default function OwnerDashboard({ bookings: initialBookings }: OwnerDashboardProps) {
    const [bookings, setBookings] = React.useState(initialBookings);
    const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
    const [isPanelOpen, setPanelOpen] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();

    React.useEffect(() => {
        setBookings(initialBookings);
    }, [initialBookings]);

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
            // No longer need to update local state, revalidate will handle it
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
            // No longer need to update local state, revalidate will handle it
            toast({ title: "Booking Deleted", description: "The booking has been successfully removed." });
            setPanelOpen(false);
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: "Deletion Failed", description: result.error });
        }
    };

    return (
        <>
            <div className="space-y-6">
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
