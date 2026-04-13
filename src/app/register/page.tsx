"use client";

import { registerUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const success = searchParams.get("success");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (formData: FormData) => {
    setIsLoading(true);

    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";

    if (!email || !password || !confirmPassword) {
      router.push("/register?error=Missing required fields");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      router.push("/register?error=Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerUser(formData);

      if (!result || result.error) {
        router.push(
          `/register?error=${encodeURIComponent(
            result?.error || "Registration failed"
          )}`
        );
      } else {
        router.push("/login?success=Account created successfully. Please sign in.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      router.push("/register?error=Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await handleRegister(formData);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-background text-foreground pt-10 pb-10">
      
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background" />

      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-40 pointer-events-none" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md p-8 md:p-10 mx-4">
        <div className="absolute inset-0 bg-card/80 backdrop-blur-2xl rounded-3xl border border-border shadow-xl" />

        <div className="relative flex flex-col items-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-muted border border-border mb-6">
            <Command className="w-8 h-8 text-foreground" />
          </div>

          {/* TITLE */}
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
            Create account
          </h1>

          <p className="text-sm text-muted-foreground text-center mb-8">
            Sign up to get started with our AI platform.
          </p>

          {error && (
            <div className="w-full p-4 mb-6 bg-destructive/10 border border-destructive/30 rounded-2xl text-destructive text-sm">
              {decodeURIComponent(error)}
            </div>
          )}

          {success && (
            <div className="w-full p-4 mb-6 bg-primary/10 border border-primary/30 rounded-2xl text-primary text-sm">
              Account created! Redirecting...
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                className="h-11 bg-background/50 border-border text-foreground focus-visible:ring-ring"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                className="h-11 bg-background/50 border-border text-foreground focus-visible:ring-ring"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Strong password"
                className="h-11 bg-background/50 border-border text-foreground focus-visible:ring-ring"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-muted-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="h-11 bg-background/50 border-border text-foreground focus-visible:ring-ring"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-semibold"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* DIVIDER */}
          <div className="relative w-full my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex w-full h-12 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground font-medium transition hover:bg-accent hover:text-foreground"
          >
            Sign In
          </Link>

          <p className="mt-8 text-[13px] text-muted-foreground text-center px-4">
            By signing up, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-muted-foreground">
          Loading...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}