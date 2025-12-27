'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-600">MCK.GG</span>
        </Link>
      </div>
    </header>
  );
}
