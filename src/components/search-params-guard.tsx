"use client";

import { useSearchParams as useSearchParamsHook } from "next/navigation";
import { Suspense } from "react";
import type { ReactNode } from "react";

export function SearchParamsGuard({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}

export function useSearchParams() {
  return useSearchParamsHook();
}
