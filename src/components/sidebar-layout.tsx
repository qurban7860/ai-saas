"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Menu, X, Plus } from "lucide-react";

interface SidebarLayoutProps {
  children?: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground">

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <Header />

      <div className="h-[calc(100vh-4rem)] flex">

        <aside
          className={`
            fixed lg:static z-50
            h-full w-[280px]
            bg-sidebar border-r border-border
            transition-transform duration-300 ease-out
            ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="h-full flex flex-col">

            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold mb-3">
                Conversations
              </h2>

              <Button className="w-full cursor-pointer" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>

            <div className="p-4 text-sm text-muted-foreground">
              No conversations yet
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">

          <div className="lg:hidden p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}