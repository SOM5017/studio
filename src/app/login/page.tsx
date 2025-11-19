
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { auth } = useFirebase();
    const router = useRouter();
    const [email, setEmail] = useState('owner@example.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start with loading true to check auth state
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        if (!isLoading && user) {
            router.push('/owner');
        }
    }, [isLoading, user, router]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        if (!auth) {
            setError("Authentication service is not available.");
            return;
        }

        setIsLoggingIn(true);
        setError(null);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener will handle the redirect
        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setError("Invalid credentials. Please try again.");
            }
            else {
                setError("An unexpected error occurred. Please try again later.");
            }
            setIsLoggingIn(false);
        }
    };
    
    if (isLoading || user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-full items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Owner Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the owner dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Username</Label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="owner"
                                value={email.split('@')[0]}
                                onChange={(e) => setEmail(`${e.target.value}@example.com`)}
                                required
                                disabled={isLoggingIn}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoggingIn}
                            />
                        </div>
                        {error && (
                            <p className="text-sm font-medium text-destructive">{error}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={isLoggingIn}>
                            {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
