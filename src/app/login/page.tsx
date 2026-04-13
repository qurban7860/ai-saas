"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense, type FormEvent } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const success = searchParams.get("success");
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push(`/login?error=${encodeURIComponent(result.error)}`);
      } else {
        router.push("/chat");
      }
    } catch (error) {
      console.error("Login error:", error);
      router.push("/login?error=login-failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/chat" });
    } catch (error) {
      console.error("Google login error:", error);
      router.push("/login?error=google-failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-background text-foreground pt-10 pb-10">
      
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background" />

      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 md:p-10 mx-4">
        <div className="absolute inset-0 bg-card/80 backdrop-blur-2xl rounded-3xl border border-border shadow-xl" />

        <div className="relative flex flex-col items-center">
          
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-muted border border-border mb-6">
            <Command className="w-8 h-8 text-foreground" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
            Welcome back
          </h1>

          <p className="text-sm text-muted-foreground text-center mb-8">
            Please sign in to your account to continue.
          </p>

          {error && (
            <div className="w-full p-4 mb-6 bg-destructive/10 border border-destructive/30 rounded-2xl text-destructive text-sm">
              {decodeURIComponent(error)}
            </div>
          )}

          {success && (
            <div className="w-full p-4 mb-6 bg-primary/10 border border-primary/30 rounded-2xl text-primary text-sm">
              {decodeURIComponent(success)}
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className="w-full space-y-4">
            
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
                placeholder="Your password"
                className="h-11 bg-background/50 border-border text-foreground focus-visible:ring-ring"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-semibold cursor-pointer"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="relative w-full my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            size="lg"
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          {/* FOOTER */}
          <p className="mt-6 text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline underline-offset-4 font-medium"
            >
              Create one
            </Link>
          </p>

          <p className="mt-8 text-[13px] text-muted-foreground text-center px-4">
            By clicking continue, you agree to our{" "}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-muted-foreground">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}