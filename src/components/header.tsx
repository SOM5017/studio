
'use client';
import Link from 'next/link';
import { AppIcon } from '@/components/icons';
import { Button } from './ui/button';

export default function Header() {

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
              <Button asChild>
                <Link href="/owner">Owner View</Link>
              </Button>
            </nav>
        </div>
      </div>
    </header>
  );
}
