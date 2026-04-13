"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      fallback || (
        <div className="w-full h-screen flex items-center justify-center bg-zinc-950">
          <div className="text-center">
            <div className="w-8 h-8 bg-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
