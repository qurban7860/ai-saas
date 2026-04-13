"use client";

import { Header } from "@/components/header";
import { Brain, Zap, Shield, MessageSquare, Folder, Users } from "lucide-react";

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

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground pt-24">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Powerful Features for AI-Powered Workflows
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the advanced capabilities that make our AI SaaS platform the perfect choice for modern productivity.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card p-8 text-left">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/12 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-card-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-7 text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}