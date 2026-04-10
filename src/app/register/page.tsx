 "use client";

import { registerUser } from "./actions";
import { signIn } from "next-auth/react";
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
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

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
      if (result.error) {
        router.push(`/register?error=${encodeURIComponent(result.error)}`);
      } else {
        // Registration successful, now sign in
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (signInResult?.error) {
          router.push(`/register?error=${encodeURIComponent("Account created but sign in failed: " + signInResult.error)}`);
        } else {
          router.push("/");
        }
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
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-zinc-950 font-sans pt-10 pb-10">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950" />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] opacity-60 mix-blend-screen pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[128px] opacity-40 mix-blend-screen pointer-events-none" />

      {/* Glassmorphism Register Card */}
      <div className="relative z-10 w-full max-w-md p-8 md:p-10 mx-4">
        <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-800/60 shadow-2xl" />

        <div className="relative flex flex-col items-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-zinc-800/80 border border-zinc-700/50 shadow-inner mb-6">
            <Command className="w-8 h-8 text-zinc-100" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
            Create account
          </h1>
          <p className="text-sm text-zinc-400 text-center mb-8">
            Sign up to get started with our AI platform.
          </p>

          {error && (
            <div className="w-full p-4 mb-6 bg-destructive/10 border border-destructive/30 rounded-2xl text-destructive text-sm">
              {decodeURIComponent(error)}
            </div>
          )}

          {success && (
            <div className="w-full p-4 mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm">
              Account created! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-emerald-500/50 text-white h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-emerald-500/50 text-white h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 chars: uppercase, lowercase, number, special"
                className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-emerald-500/50 text-white h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-emerald-500/50 text-white h-11"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-11 font-semibold transition-all">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="relative w-full my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900/50 backdrop-blur-xl px-2 text-zinc-500">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex w-full h-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950/80 text-zinc-300 font-medium transition hover:border-zinc-600 hover:bg-zinc-900/50"
          >
            Sign In
          </Link>

          <p className="mt-8 text-[13px] text-zinc-500 text-center px-4">
            By signing up, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-zinc-300 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-zinc-300 transition-colors">
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
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}