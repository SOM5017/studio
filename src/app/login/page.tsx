
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Login'}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, null);
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // Redirect if the user is already logged in and the session is confirmed.
  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/owner');
    }
  }, [user, isUserLoading, router]);

  // Also redirect if the server action has just completed successfully.
  // This handles the immediate redirect after form submission.
  useEffect(() => {
    if (state?.success) {
      router.replace('/owner');
    }
  }, [state, router]);

  // While checking auth state, show a loading screen to prevent form flash.
  if (isUserLoading) {
     return (
        <div className="flex h-full w-full flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Verifying session...</p>
        </div>
    );
  }
  
  // If the user is already logged in but the redirect hasn't happened yet,
  // also show a loading/redirecting message.
  if (user) {
    return (
       <div className="flex h-full w-full flex-col items-center justify-center">
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
           <p className="mt-4 text-muted-foreground">Redirecting...</p>
       </div>
   );
  }

  // Only show the login form if loading is complete and there is no user.
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Owner Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              {state?.message && !state?.success && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  defaultValue="admin123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  defaultValue="admin123"
                />
              </div>

              <div>
                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
