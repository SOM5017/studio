
"use client";
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : "Login"}
        </Button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useActionState(loginAction, { error: undefined });
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        // If the user is already logged in, redirect them away from the login page.
        if (!isUserLoading && user) {
            router.replace('/owner');
        }
    }, [user, isUserLoading, router]);


    // While we check for the user or if they exist, show a loading spinner.
    if (isUserLoading || user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    // If the user is not logged in, show the login form.
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Owner Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the owner dashboard.
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="admin"
                                required
                                defaultValue="admin"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="admin"
                                required
                                defaultValue="admin"
                            />
                        </div>
                         {state?.error && (
                            <p className="text-sm text-destructive">{state.error}</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <SubmitButton />
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
