import Link from 'next/link';
import { AppIcon } from '@/components/icons';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AppIcon className="h-6 w-6" />
            <span className="font-bold sm:inline-block">
              BookEase Accommodations
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                    <Link href="/">Customer View</Link>
                </Button>
                <Button asChild variant="ghost">
                    <Link href="/owner">Owner View</Link>
                </Button>
            </nav>
        </div>
      </div>
    </header>
  );
}
