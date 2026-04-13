"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Menu, X, Plus } from "lucide-react";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="fixed top-4 left-4 z-40 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-zinc-300 hover:text-white hover:bg-zinc-900/60"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed left-0 top-0 z-40 w-72 h-screen bg-[var(--surface)]/95 border-r border-white/10 shadow-[0_32px_76px_-40px_rgba(15,23,42,0.7)] transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-72 overflow-y-auto`}
      >
        <div className="p-6">
          <h2 className="text-sm font-semibold text-card-foreground mb-4">Conversations</h2>
          <Button
            size="sm"
            className="w-full mb-4 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setSidebarOpen(false)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="px-6 py-4 text-muted-foreground text-sm">
          <p>No conversations yet. Start a new chat to begin.</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden lg:pl-72">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
