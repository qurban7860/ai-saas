"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Zap } from "lucide-react";

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

export default function PricingPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground pt-24">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choose the Perfect Plan for Your Needs
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start free and scale as you grow. All plans include our core AI features with different levels of usage and support.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`glass-card p-8 text-left relative ${plan.popular ? 'border-primary/50' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-3xl font-bold text-card-foreground mb-4">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground ml-2 text-xl">{plan.period}</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-muted-foreground">
                      <Zap className="w-5 h-5 text-primary mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full inline-flex items-center justify-center rounded-xl px-6 py-4 text-lg font-semibold transition-all ${
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

          <div className="text-center mt-16">
            <p className="text-muted-foreground">
              All plans include 30-day money-back guarantee. Need help choosing? <Link href="/about" className="text-primary hover:underline">Contact our team</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}