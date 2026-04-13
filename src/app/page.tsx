"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Zap, Shield } from "lucide-react";
import { useState, useEffect } from "react";

function LandingPageContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden pt-24 pb-20 px-4 md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_26%)]" />
        <div className="absolute inset-x-0 top-24 mx-auto h-80 max-w-4xl rounded-[2rem] bg-primary/10 blur-[120px] opacity-60" />

        <div className="relative z-10 container mx-auto flex flex-col items-center gap-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="font-bold text-2xl tracking-tight text-white">
              AI SaaS
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white max-w-4xl">
            The future of <span className="text-primary">AI-powered workflows</span> that feel modern, fast, and premium.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-8">
            Build smarter productivity flows with a powerful AI assistant, secure authentication, and a beautiful dashboard experience.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-[0_24px_80px_-40px_rgba(56,189,248,0.8)] transition-all hover:bg-primary/90"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-zinc-100 transition-all hover:border-white/20 hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-zinc-900/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Why Choose Our AI Platform?
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <Brain className="w-6 h-6 text-primary" />,
                title: "Advanced AI Models",
                description: "Access powerful AI reasoning and generation for smarter workflows.",
              },
              {
                icon: <Zap className="w-6 h-6 text-primary" />,
                title: "Lightning Fast",
                description: "Enjoy instant responses with optimized chat and session handling.",
              },
              {
                icon: <Shield className="w-6 h-6 text-primary" />,
                title: "Secure & Private",
                description: "Protect your data with modern auth, session security, and encrypted storage.",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6 text-left">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/12 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-7">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-xl mx-auto">
            Join thousands of users who are already leveraging AI to transform their work.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (status === "authenticated" && session) {
      router.push("/chat");
    }
  }, [status, session, router]);

  if (!isClient || status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LandingPageContent />;
  }

  return null;
}
