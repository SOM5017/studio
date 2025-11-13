'use server';

/**
 * @fileOverview Fraud detection AI agent.
 *
 * - detectFraudulentBookings - A function that detects fraudulent booking patterns.
 * - DetectFraudulentBookingsInput - The input type for the detectFraudulentBookings function.
 * - DetectFraudulentBookingsOutput - The return type for the detectFraudulentBookings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectFraudulentBookingsInputSchema = z.object({
  durationOfStay: z
    .string()
    .describe('The duration of the stay (start and end date).'),
  fullName: z.string().describe('The full name of the guest.'),
  mobileNumber: z.string().describe('The mobile number of the guest.'),
  address: z.string().describe('The address of the guest.'),
  numberOfGuests: z.number().describe('The number of guests.'),
  namesOfGuests: z.string().describe('The names of the guests.'),
  paymentMethod: z.string().describe('The payment method used for the booking.'),
});
export type DetectFraudulentBookingsInput = z.infer<
  typeof DetectFraudulentBookingsInputSchema
>;

const DetectFraudulentBookingsOutputSchema = z.object({
  isFraudulent: z
    .boolean()
    .describe('Whether or not the booking is potentially fraudulent.'),
  fraudulentReason: z
    .string()
    .describe('The reason why the booking is potentially fraudulent.'),
});
export type DetectFraudulentBookingsOutput = z.infer<
  typeof DetectFraudulentBookingsOutputSchema
>;

export async function detectFraudulentBookings(
  input: DetectFraudulentBookingsInput
): Promise<DetectFraudulentBookingsOutput> {
  return detectFraudulentBookingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectFraudulentBookingsPrompt',
  input: {schema: DetectFraudulentBookingsInputSchema},
  output: {schema: DetectFraudulentBookingsOutputSchema},
  prompt: `You are an expert in detecting fraudulent booking patterns for transient accommodations.

You will analyze the booking details provided and determine if the booking is potentially fraudulent.

Consider factors such as:
- Inconsistencies in the provided information (e.g. mismatched name and address)
- Unusual booking patterns
- Suspicious payment methods
- Vague or incomplete address information

Booking Details:
Duration of Stay: {{{durationOfStay}}}
Full Name: {{{fullName}}}
Mobile Number: {{{mobileNumber}}}
Address: {{{address}}}
Number of Guests: {{{numberOfGuests}}}
Names of Guests: {{{namesOfGuests}}}
Payment Method: {{{paymentMethod}}}

Based on the above information, determine if the booking is fraudulent and provide a reason for your determination.

Output in JSON format.
`,
});

const detectFraudulentBookingsFlow = ai.defineFlow(
  {
    name: 'detectFraudulentBookingsFlow',
    inputSchema: DetectFraudulentBookingsInputSchema,
    outputSchema: DetectFraudulentBookingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
