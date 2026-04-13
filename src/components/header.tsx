"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Command } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.75)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
            <Command className="w-5 h-5 text-zinc-100" />
          </div>
          <span className="font-bold text-lg text-white">AI SaaS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/features"
            className="text-zinc-300 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-zinc-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="text-zinc-300 hover:text-white transition-colors"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {status === "loading" ? (
            <div className="w-8 h-8 bg-zinc-800 rounded-full animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="text-zinc-300 text-sm">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Link href="/login" className="text-zinc-300 hover:text-white">
                  Sign In
                </Link>
              </Button>
              <Button size="sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}