"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizontal, Loader2, Copy, RefreshCcw, AlertCircle, Zap, Brain, BookOpen, Lightbulb, ArrowDown } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import type { Message } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatInterfaceProps {
  sessionId: string;
  initialMessages: Message[];
  userName?: string | null;
  userImage?: string | null;
}

type ChatMode = "DEFAULT" | "PROFESSIONAL" | "CREATIVE" | "TECHNICAL" | "TEACHING";

interface ChatModeConfig {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: ChatMode;
}

const CHAT_MODES: ChatModeConfig[] = [
  { icon: <Zap className="w-4 h-4" />, label: "Fast", description: "Quick responses", value: "DEFAULT" },
  { icon: <Brain className="w-4 h-4" />, label: "Professional", description: "Formal tone", value: "PROFESSIONAL" },
  { icon: <Lightbulb className="w-4 h-4" />, label: "Creative", description: "Imaginative", value: "CREATIVE" },
  { icon: <BookOpen className="w-4 h-4" />, label: "Technical", description: "Detailed", value: "TECHNICAL" },
];

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
    handleSubmit: originalHandleSubmit,
    isLoading,
    reload,
    error,
    setMessages,
  } = useChat({
    api: "/api/chat",
    streamProtocol: "text",
    body: { sessionId, chatMode: "DEFAULT" },
    initialMessages,
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ChatMode>("DEFAULT");
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    if (isAutoScrolling) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAutoScrolling]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.content.includes("**(This is a demo response")) {
        setIsDemo(true);
      }
    }
  }, [messages]);

  const handleInputChangeWithCount = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(e);
      setCharCount(e.target.value.length);
    },
    [handleInputChange]
  );

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (rateLimitRemaining !== null && rateLimitRemaining <= 5 && rateLimitRemaining > 0) {
      setShowQuotaWarning(true);
      setTimeout(() => setShowQuotaWarning(false), 3000);
    }

    setIsAutoScrolling(true); 

    originalHandleSubmit(e, {
      data: { chatMode: selectedMode },
    });

    setCharCount(0);
  };

  const resumeScroll = () => {
    setIsAutoScrolling(true);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full w-full rounded-3xl glass-card overflow-hidden">
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-card/80 border-b border-border">
        {isDemo && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-500 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> Demo Mode: API quota exceeded. Using cached responses.
            </p>
          </div>
        )}

        {showQuotaWarning && rateLimitRemaining !== null && (
          <div className="bg-orange-500/10 border-b border-orange-500/20 px-5 py-2">
            <p className="text-xs font-medium text-orange-700 dark:text-orange-500 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> Only {rateLimitRemaining} requests remaining this minute
            </p>
          </div>
        )}

        <div className="px-5 py-4 lg:pl-16 transition-[padding] duration-300 ease-in-out">
          <h2 className="text-lg md:text-xl font-semibold text-card-foreground mb-3">AI Assistant</h2>
          <p className="text-sm text-muted-foreground mb-3">Intelligent, fast, and context-aware responses.</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
            {CHAT_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => { setSelectedMode(mode.value); setShowModeSelector(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  selectedMode === mode.value ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
                title={mode.description}
              >
                {mode.icon}
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div 
        className="flex-1 relative overflow-hidden min-h-0"
        onWheel={() => setIsAutoScrolling(false)}
        onTouchMove={() => setIsAutoScrolling(false)}
      >
        <ScrollArea className="h-full px-4 py-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-10">
                <div className="text-4xl mb-3">👋</div>
                <p>Start a conversation</p>
                <p className="text-xs mt-2">Try asking something using the {selectedMode} mode</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{error.message || "Failed to get response"}</p>
                </div>
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.role === "user";
              const time = new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              return (
                <div key={m.id} className={`group flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">AI</AvatarFallback>
                    </Avatar>
                  )}

                  <div className="relative max-w-[85%] md:max-w-[70%]">
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isUser ? "bg-primary text-primary-foreground rounded-br-md shadow-md" : "bg-muted text-foreground border border-border rounded-bl-md shadow-sm"
                      }`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: ({ node, inline, children, ...props }: any) => (
                            <code className={`${inline ? "bg-background/50 px-1.5 py-0.5 rounded text-xs" : "block bg-background/50 p-2 rounded mt-2 mb-2 overflow-x-auto"}`} {...props}>
                              {children}
                            </code>
                          ),
                          a: ({ node, href, children, ...props }: any) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" {...props}>
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {m.content.replace(/\n\n\*\*\(This is a demo response[^)]*\)\*\*/, "")}
                      </ReactMarkdown>
                    </div>

                    {!isUser && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 mt-2 ml-1">
                        <button onClick={() => handleCopy(m.id, m.content)} className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 cursor-pointer transition-colors">
                          <Copy className="w-3 h-3" /> {copiedId === m.id ? "Copied!" : "Copy"}
                        </button>
                        <span className="text-muted-foreground/30">•</span>
                        <button onClick={() => reload()} disabled={isLoading} className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50">
                          <RefreshCcw className="w-3 h-3" /> Regenerate
                        </button>
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground mt-1 px-1">{time}</div>
                  </div>

                  {isUser && (
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={userImage || ""} alt={userName || ""} referrerPolicy="no-referrer" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{userName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3 animate-in fade-in">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">AI</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted border border-border shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-foreground font-medium">
                    {selectedMode === "DEFAULT" ? "Thinking..." : `Responding in ${selectedMode.toLowerCase()} mode...`}
                  </span>
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {!isAutoScrolling && messages.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-2">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full shadow-lg border border-border/50 bg-background/90 backdrop-blur-sm gap-2 text-xs"
              onClick={resumeScroll}
            >
              <ArrowDown className="w-3 h-3" /> Scroll to bottom
            </Button>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur-xl px-4 py-4 z-10">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Input
              value={input}
              onChange={handleInputChangeWithCount}
              placeholder={`Ask anything using ${selectedMode} mode...`}
              className="flex-1 rounded-full px-4 h-11 bg-muted border-border focus-visible:ring-1 focus-visible:ring-ring"
              disabled={isLoading}
              maxLength={10000}
              autoFocus
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full h-11 w-11 cursor-pointer flex-shrink-0">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
            </Button>
          </div>
          {charCount > 0 && <div className="text-xs text-muted-foreground mt-2 text-right">{charCount} / 10000</div>}
        </form>
      </div>
    </div>
  );
}