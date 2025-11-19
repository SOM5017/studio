'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppIcon } from '@/components/icons';
import { Button } from './ui/button';
import { useFirebase } from '@/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { auth } = useFirebase();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AppIcon className="h-6 w-6" />
            <span className="font-bold sm:inline-block">
              JMRN Transient HOMES
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
             <Link
                href="/"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Customer View
              </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              {isLoading ? (
                <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
              ) : user ? (
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              ) : (
                <Button asChild>
                  <Link href="/login">Owner View</Link>
                </Button>
              )}
            </nav>
        </div>
      </div>
    </header>
  );
}
