"use client";

import { Header } from "@/components/header";
import { Settings, Users, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground pt-24">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About AI SaaS
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering the future with cutting-edge AI technology for everyone.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <p className="text-lg text-muted-foreground leading-8 mb-8">
              AI SaaS is a cutting-edge platform that leverages advanced AI technologies to enhance productivity and streamline workflows. Our mission is to make AI accessible and powerful for everyone, from individuals to enterprises. With a focus on security, speed, and user experience, we provide the tools you need to build the future.
            </p>
            <p className="text-lg text-muted-foreground leading-8 mb-8">
              Founded with the vision of democratizing AI, we combine state-of-the-art machine learning models with intuitive interfaces to create solutions that adapt to your needs. Whether you're a developer building the next big app, a business optimizing operations, or an individual seeking smarter ways to work, AI SaaS is your trusted partner in the AI revolution.
            </p>
            <p className="text-lg text-muted-foreground leading-8">
              Join thousands of users who are already transforming their workflows with our platform. Experience the power of AI made simple, secure, and scalable.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="glass-card p-8 text-center">
              <Settings className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Customizable</h3>
              <p className="text-muted-foreground">Tailor the platform to fit your specific workflow requirements and preferences.</p>
            </div>
            <div className="glass-card p-8 text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Team Ready</h3>
              <p className="text-muted-foreground">Built for collaboration with enterprise-grade features for teams of all sizes.</p>
            </div>
            <div className="glass-card p-8 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Enterprise Security</h3>
              <p className="text-muted-foreground">Bank-level security with end-to-end encryption and compliance standards.</p>
            </div>
          </div>

          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join the AI revolution today and transform the way you work.
            </p>
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Start Your Free Trial
            </a>
          </div>
        </div>
      </div>
    </>
  );
}