'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { createGenkitHandler } from '@genkit-ai/next';


export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

export const POST = createGenkitHandler({ai});
