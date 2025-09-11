// components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-2 py-3">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            마중
          </Link>

          <ul className="hidden gap-5 sm:flex">
            <li><Link href="/about" className="text-sm hover:opacity-70">소개</Link></li>
            <li><Link href="/support" className="text-sm hover:opacity-70">목장후원</Link></li>
            <li><Link href="/donate" className="text-sm hover:opacity-70">바로기부</Link></li>
          </ul>
        </div>

        {/* Right: actions */}
        <div className="hidden sm:block">
          <Link
            href="/login"
            className="rounded border px-4 py-1 text-sm hover:bg-gray-50"
          >
            로그인
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(v => !v)}
        >
          {/* 햄버거 아이콘 (간단히) */}
          <div className="h-0.5 w-6 bg-black mb-1.5" />
          <div className="h-0.5 w-6 bg-black mb-1.5" />
          <div className="h-0.5 w-6 bg-black" />
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="sm:hidden border-t bg-white">
          <ul className="mx-4 my-2 flex flex-col gap-2 py-2">
            <li><Link href="/about" onClick={() => setOpen(false)}>소개</Link></li>
            <li><Link href="/support" onClick={() => setOpen(false)}>목장후원</Link></li>
            <li><Link href="/donate" onClick={() => setOpen(false)}>바로기부</Link></li>
            <li className="pt-2">
              <Link
                href="/login"
                className="inline-block rounded border px-4 py-1"
                onClick={() => setOpen(false)}
              >
                로그인
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
