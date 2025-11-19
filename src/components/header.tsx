
'use client';

import Link from 'next/link';
import { AppIcon } from '@/components/icons';
import { Button } from './ui/button';
import { logoutAction } from '@/app/actions';
import { useUser } from '@/firebase';
import { useFormStatus } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" disabled={pending}>
      {pending ? "Logging out..." : "Logout"}
    </Button>
  );
}

export default function Header() {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  // We add a state to force re-evaluation on path change.
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    setKey(Date.now());
  }, [pathname]);


  return (
    <header key={key} className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AppIcon className="h-6 w-6" />
            <span className="font-bold sm:inline-block">
              JMRN Transient HOMES
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
                {pathname !== '/' && (
                  <Button asChild variant="ghost">
                      <Link href="/">Customer View</Link>
                  </Button>
                )}
                
                {isUserLoading ? null : user ? (
                  <>
                    {pathname !== '/owner' && (
                        <Button asChild>
                            <Link href="/owner">Owner View</Link>
                        </Button>
                    )}
                    <form action={logoutAction}>
                      <LogoutButton />
                    </form>
                  </>
                ) : (
                  pathname !== '/login' && (
                    <Button asChild>
                      <Link href="/login">Owner Login</Link>
                    </Button>
                  )
                )}
            </nav>
        </div>
      </div>
    </header>
  );
}
