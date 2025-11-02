"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { PaymentMethod, paymentMethods } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  mobileNumber: z.string().regex(/^(09|\+639)\d{9}$/, { message: 'Please enter a valid PH mobile number.' }),
  numberOfGuests: z.coerce.number().min(1, { message: 'At least one guest is required.' }),
  namesOfGuests: z.string().min(2, { message: 'Please list the names of the guests.' }),
  paymentMethod: z.enum(paymentMethods, { required_error: 'Please select a payment method.' }),
});

export type BookingFormValues = z.infer<typeof formSchema>;

interface BookingFormProps {
    range: DateRange;
    onSubmit: (values: BookingFormValues) => void;
    isLoading: boolean;
}

export function BookingForm({ range, onSubmit, isLoading }: BookingFormProps) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      numberOfGuests: 1,
      namesOfGuests: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm p-3 bg-secondary rounded-md">
            <div><strong>Check-in:</strong> {range.from ? format(range.from, 'PPP') : ''}</div>
            <div><strong>Check-out:</strong> {range.to ? format(range.to, 'PPP') : ''}</div>
        </div>
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Juan Dela Cruz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobileNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input placeholder="09171234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numberOfGuests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Guests</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="namesOfGuests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Names of Guests</FormLabel>
              <FormControl>
                <Textarea placeholder="Juan Dela Cruz, Jane Doe..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select how you'll pay" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="cash">Cash on Arrival</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Booking Request
        </Button>
      </form>
    </Form>
  );
}
