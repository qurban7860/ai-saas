"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizontal, Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";
import type { Message } from "@ai-sdk/react";

interface ChatInterfaceProps {
  sessionId: string;
  initialMessages: Message[];
  userName?: string | null;
  userImage?: string | null;
}
 
export function ChatInterface({
  sessionId,
  initialMessages,
  userName,
  userImage,
}: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: { sessionId },
    initialMessages,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full glass-card rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_32px_80px_-32px_rgba(15,23,42,0.65)]">
      {/* Header */}
      <div className="p-5 border-b border-white/10 bg-[var(--surface)]/80 backdrop-blur-xl">
        <h2 className="font-semibold text-card-foreground text-lg md:text-xl">AI Conversation</h2>
        <p className="text-sm text-muted-foreground mt-1">Ask anything and get intelligent, contextual answers.</p>
      </div>

      {/* Message Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground pt-10">
              No messages yet. Start a conversation below!
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"} items-end`}
            >
              <Avatar className="w-10 h-10 shrink-0">
                {m.role === "user" ? (
                  <>
                    <AvatarImage src={userImage || ""} />
                    <AvatarFallback>{userName?.charAt(0) || "U"}</AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="/ai-avatar.png" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      AI
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div
                className={`px-4 py-3 rounded-[1.5rem] max-w-[80%] shadow-[0_18px_60px_-40px_rgba(15,23,42,0.55)] ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-[0.85rem] rounded-bl-[0.85rem]"
                    : "bg-[var(--surface)] text-card-foreground rounded-tl-[0.85rem] rounded-br-[0.85rem] border border-white/10"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 items-end">
               <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AI
                  </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface)] text-card-foreground rounded-[1.5rem] border border-white/10 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.45)]">
                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                <span className="text-sm text-muted-foreground">AI is typing...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-[var(--surface)]/90 border-t border-white/10 backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            handleSubmit(e);
          }}
          className="flex flex-col gap-3 sm:flex-row items-center"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 rounded-full bg-background/90 border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shadow-[0_18px_40px_-20px_rgba(15,23,42,0.55)] transition-transform active:scale-95"
            disabled={isLoading || !input.trim()}
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
