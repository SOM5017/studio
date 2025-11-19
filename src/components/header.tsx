
'use client';
import Link from 'next/link';
import { AppIcon } from '@/components/icons';
import { Button } from './ui/button';
import { useAuth } from '@/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const auth = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
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
                Bookings
              </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              {user ? (
                 <Button onClick={handleLogout} variant="ghost">Logout</Button>
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
