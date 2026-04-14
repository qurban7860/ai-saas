"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Command } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-60 bg-background/80 backdrop-blur-xl border-b border-border shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted border border-border">
            {!session &&<Command className="w-5 h-5 text-foreground" />}
            {session &&<Image src="/app-icon.svg" alt="App Icon" width={32} height={32} className="logo" />}
          </div>
          <span className="font-bold text-lg text-foreground line-clamp-1">
            AI SaaS
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />

          {status === "loading" ? (
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-3">
              {/* {session?.user?.image && ( */}
                <Avatar className="w-8 h-8 border border-border transition-transform hover:scale-105">
                  <AvatarImage src={session?.user?.image || ""} referrerPolicy="no-referrer" />

                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {(session?.user?.name || session?.user?.email || "U")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              {/* )} */}

              <div className="flex-col leading-tight hidden sm:flex">
                <span className="text-sm font-medium text-foreground">
                  {session?.user?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {session?.user?.email}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Link href="/login" className="text-muted-foreground hover:text-foreground cursor-pointer">
                  Sign In
                </Link>
              </Button>

              <Button size="sm" className="rounded-full cursor-pointer">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}