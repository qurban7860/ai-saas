"use client";

import { AuthGuard } from "@/components/auth-guard";
import { SidebarLayout } from "@/components/sidebar-layout";
import { ChatInterface } from "@/features/chat/components/chat-interface";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, RefreshCcw, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createChatSessionAction, getChatMessagesAction } from "@/features/chat/chat.actions";
import type { Message } from "@ai-sdk/react";

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlSessionId = searchParams.get('sessionId');
    if (urlSessionId !== sessionId) {
      setSessionId(urlSessionId || "");
    }
  }, [searchParams, sessionId]);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    const loadMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getChatMessagesAction(sessionId);
        if (result.success && result.messages && isMounted) {
          const aiMessages: Message[] = result.messages.map((msg: any) => ( {
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            createdAt: msg.createdAt,
          }));
          setMessages(aiMessages);
        } else if (!result.success && isMounted) {
          setError(result.error || "Failed to load conversation");
        }
      } catch (err) {
        if (isMounted) setError("An unexpected error occurred while loading");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMessages();
    return () => { isMounted = false; };
  }, [sessionId]);

  const handleNewChat = async () => {
    const result = await createChatSessionAction();
    if (result.success && result.chat) {
      router.push(`?sessionId=${result.chat.id}`);
    }
  };

  if (!session) {
    return (
      <AuthGuard>
        <div className="h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <SidebarLayout>
        <div className="flex-1 flex flex-col h-full bg-background/50">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
                <div className="w-10 h-10 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-medium tracking-tight">Syncing conversation...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 max-w-md text-center p-6 border border-destructive/20 rounded-xl bg-destructive/5">
                <AlertCircle className="w-10 h-10 text-destructive" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Failed to load chat</h3>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-2 gap-2">
                  <RefreshCcw className="w-4 h-4" /> Retry
                </Button>
              </div>
            </div>
          ) : sessionId ? (
            <div className="flex-1 h-full relative">
              <ChatInterface
                sessionId={sessionId}
                initialMessages={messages}
                userName={session.user?.name}
                userImage={session.user?.image}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="max-w-md w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="mb-8 p-6 bg-primary/5 rounded-full w-24 h-24 mx-auto flex items-center justify-center ring-1 ring-primary/10">
                  <MessageCircle className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-3">How can I help you today?</h1>
                <p className="text-muted-foreground mb-8 text-lg">
                  Start a new conversation or select one from the sidebar.
                </p>
                <Button onClick={handleNewChat} className="gap-2 text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                  <Plus className="w-5 h-5" />
                  <span>Start a New Conversation</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}