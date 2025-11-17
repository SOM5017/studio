
"use client";

import { Booking, BookingStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { List } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const statusBadgeVariants: Record<BookingStatus, "default" | "secondary" | "destructive"> = {
    pending: 'secondary',
    confirmed: 'default',
    cancelled: 'destructive'
}

interface BookingsTableProps {
    bookings: Booking[];
    onSelectBooking: (booking: Booking) => void;
}

export function BookingsTable({ bookings, onSelectBooking }: BookingsTableProps) {
     const sortedBookings = [...bookings].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <List className="h-5 w-5" />
                        <CardTitle className="text-2xl">All Bookings</CardTitle>
                    </div>
                </div>
                <CardDescription>A complete list of all your bookings, sorted by check-in date.</CardDescription>
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
                                    <Button variant="outline" size="sm" onClick={() => onSelectBooking(booking)}>
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
    )
}
