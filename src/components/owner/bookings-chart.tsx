
"use client";

import { Booking } from "@/lib/types";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";

interface BookingsChartProps {
    bookings: Booking[];
}

export function BookingsChart({ bookings }: BookingsChartProps) {
    const data = React.useMemo(() => {
        const monthCounts: { [key: string]: number } = {};
        const now = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const month = subMonths(now, i);
            const monthKey = format(month, 'MMM yyyy');
            monthCounts[monthKey] = 0;
        }

        bookings.forEach(booking => {
            const bookingMonth = startOfMonth(new Date(booking.startDate));
            const monthKey = format(bookingMonth, 'MMM yyyy');
            if (monthKey in monthCounts) {
                monthCounts[monthKey]++;
            }
        });

        return Object.entries(monthCounts).map(([name, total]) => ({ name, total }));

    }, [bookings]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                    }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
