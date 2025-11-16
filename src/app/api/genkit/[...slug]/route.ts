'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {createNextJsHandler} from '@genkit-ai/next';

import '@/ai/flows/detect-fraudulent-bookings';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

export const POST = createNextJsHandler({ai});
