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
    <div className="flex flex-col h-full bg-background border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <h2 className="font-semibold text-card-foreground">Chat Assistant</h2>
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
              className={`flex gap-3 ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Avatar className="w-8 h-8">
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
                className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
               <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AI
                  </AvatarFallback>
              </Avatar>
              <div className="flex items-center px-4 py-2 bg-muted text-foreground rounded-2xl rounded-tl-sm">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-card border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            handleSubmit(e);
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 rounded-full bg-background"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shadow-md transition-transform active:scale-95"
            disabled={isLoading || !input.trim()}
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
