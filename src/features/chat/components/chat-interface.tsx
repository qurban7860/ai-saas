"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizontal, Loader2, Copy, RefreshCcw } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import type { Message } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
  } = useChat({
    api: "/api/chat",
    body: { sessionId },
    initialMessages,
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col h-full w-full rounded-3xl glass-card overflow-hidden">
      
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-card/80 border-b border-border px-5 py-4">
        <h2 className="text-lg md:text-xl font-semibold text-card-foreground">
          AI Assistant
        </h2>
        <p className="text-sm text-muted-foreground">
          Intelligent, fast, and context-aware responses.
        </p>
      </div>

      {/* 🔥 Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-10">
              Start a conversation 👋
            </div>
          )}

          {messages.map((m, index) => {
            const isUser = m.role === "user";
            const time = new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={m.id}
                className={`group flex items-end gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="relative max-w-[85%] md:max-w-[70%]">
                  
                  <div
                    className={`
                      px-4 py-3 rounded-2xl text-sm leading-relaxed
                      ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground border border-border rounded-bl-md"
                      }
                    `}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>

                  {!isUser && (
                    <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2 mt-2 ml-1">
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedId === m.id ? "Copied" : "Copy"}
                      </button>

                      <button
                        onClick={() => reload()}
                        className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        Regenerate
                      </button>
                    </div>
                  )}

                  <div className="text-[10px] text-muted-foreground mt-1 px-1">
                    {time}
                  </div>
                </div>

                {isUser && (
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={userImage || ""} />
                    <AvatarFallback>
                      {userName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  AI
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border bg-background/80 backdrop-blur-xl px-4 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            handleSubmit(e);
          }}
          className="max-w-3xl mx-auto flex items-center gap-3"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
            className="flex-1 rounded-full px-4 h-11 bg-muted border-border focus-visible:ring-1 focus-visible:ring-ring"
            disabled={isLoading}
          />

          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="rounded-full h-11 w-11 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SendHorizontal className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}