"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Menu, X, Plus } from "lucide-react";

interface SidebarLayoutProps {
  children?: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen text-foreground overflow-hidden">

      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hover:bg-accent text-muted-foreground cursor-pointer"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <aside
        className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          fixed lg:relative top-0 left-0 z-40
          w-72 h-full
          bg-sidebar border-r border-border
          transition-transform duration-300
          flex flex-col
        `}
      >
        <div className="p-5">
          <h2 className="text-sm font-semibold text-card-foreground mb-4">
            Conversations
          </h2>

          <Button
            size="sm"
            className="w-full cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="px-5 py-4 text-muted-foreground text-sm">
          No conversations yet.
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}