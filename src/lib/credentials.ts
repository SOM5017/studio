
'use server';

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const credentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type Credentials = z.infer<typeof credentialsSchema>;

// IMPORTANT: In a real production app, never store credentials in a plain text file.
// Use a secure database and hash passwords. This is for demonstration purposes only.
const credentialsPath = path.resolve(process.cwd(), 'src/lib/credentials.json');

async function ensureCredentialsFile() {
  try {
    await fs.access(credentialsPath);
  } catch (error) {
    // File doesn't exist, create it with default credentials
    const defaultCredentials = {
      username: 'admin',
      password: 'admin',
    };
    await fs.writeFile(credentialsPath, JSON.stringify(defaultCredentials, null, 2), 'utf-8');
  }
}

export async function getCredentials(): Promise<Credentials> {
  await ensureCredentialsFile();
  const fileContent = await fs.readFile(credentialsPath, 'utf-8');
  const credentials = JSON.parse(fileContent);
  return credentialsSchema.parse(credentials);
}

export async function saveCredentials(username: string, password: string): Promise<void> {
  const newCredentials = { username, password };
  credentialsSchema.parse(newCredentials); // Validate before saving
  await fs.writeFile(credentialsPath, JSON.stringify(newCredentials, null, 2), 'utf-8');
}
