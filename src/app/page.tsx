"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Sparkles, Brain, Zap, Shield, MessageSquare, Folder, Users, Settings } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Header } from "@/components/header";

interface LandingPageContentProps {
  session: any;
  status: string;
}

function LandingPageContent({ session, status }: LandingPageContentProps) {
  const features = [
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
    {
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
      title: "Real-time Chat",
      description: "Engage in seamless, real-time conversations with our AI assistant.",
    },
    {
      icon: <Folder className="w-6 h-6 text-primary" />,
      title: "Conversations Management",
      description: "Organize and manage your chat sessions with an intuitive sidebar.",
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Multi-session Support",
      description: "Handle multiple conversations simultaneously for better productivity.",
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: ["10 chats/month", "Basic AI models", "Community support"],
      button: "Get Started",
      href: "/register",
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      features: ["Unlimited chats", "Advanced AI models", "Priority support", "Custom integrations"],
      button: "Start Pro Trial",
      href: "/register",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: ["Everything in Pro", "Dedicated support", "SLA guarantees", "On-premise deployment"],
      button: "Contact Sales",
      href: "/about",
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground">
        <section className="relative overflow-hidden pt-24 pb-20 px-4 md:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_26%)]" />
          <div className="absolute inset-x-0 top-24 mx-auto h-80 max-w-4xl rounded-[2rem] bg-primary/10 blur-[120px] opacity-60" />

          <div className="relative z-10 container mx-auto flex flex-col items-center gap-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              {!session &&<Sparkles className="w-8 h-8 text-primary" />}
              {session && <Image src="/app-icon.svg" alt="App Icon" width={64} height={64} className="logo" />}
              <span className="font-bold text-2xl tracking-tight text-foreground">
                AI SaaS
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground max-w-4xl">
              The future of <span className="text-primary">AI-powered workflows</span> that feel modern, fast, and premium.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-8">
              Build smarter productivity flows with a powerful AI assistant, secure authentication, and a beautiful dashboard experience.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {session ? (
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-[0_24px_80px_-40px_rgba(56,189,248,0.8)] transition-all hover:bg-primary/90"
                >
                  Go to Chat
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-[0_24px_80px_-40px_rgba(56,189,248,0.8)] transition-all hover:bg-primary/90"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-base font-semibold text-card-foreground transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/20">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              Why Choose Our AI Platform?
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="glass-card p-6 text-left">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/12 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-7">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              Choose Your Plan
            </h2>

            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div key={plan.name} className={`glass-card p-6 text-left relative ${plan.popular ? 'border-primary/50' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-muted-foreground">
                        <Zap className="w-4 h-4 text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`w-full inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition-all ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {plan.button}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 px-4 bg-muted/20">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              About AI SaaS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-8 mb-8">
              AI SaaS is a cutting-edge platform that leverages advanced AI technologies to enhance productivity and streamline workflows. Our mission is to make AI accessible and powerful for everyone, from individuals to enterprises. With a focus on security, speed, and user experience, we provide the tools you need to build the future.
            </p>
            <div className="flex justify-center gap-4">
              <div className="glass-card p-4">
                <Settings className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Customizable</p>
              </div>
              <div className="glass-card p-4">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Team Ready</p>
              </div>
              <div className="glass-card p-4">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Enterprise Security</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of users who are already leveraging AI to transform their work.
            </p>
            {session ? (
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Continue to Chat
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Start Your Free Trial
              </Link>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export default function LandingPage() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <LandingPageContent session={session} status={status} />;
}
