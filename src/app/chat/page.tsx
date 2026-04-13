"use client";

import { AuthGuard } from "@/components/auth-guard";
import { SidebarLayout } from "@/components/sidebar-layout";
import { ChatInterface } from "@/features/chat/components/chat-interface";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { createChatSessionAction } from "@/features/chat/chat.actions";

export default function ChatPage() {
  const { data: session } = useSession();
  const [sessionId, setSessionId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const result = await createChatSessionAction("Chat Session");
        if (result.success && result.chat) {
          setSessionId(result.chat.id);
        }
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, []);

  return (
    <AuthGuard>
      <SidebarLayout>
        <div className="flex-1 flex flex-col px-4 py-4 lg:px-8 lg:py-6 h-full">
  {loading ? (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Starting chat session...</p>
      </div>
    </div>
  ) : sessionId ? (
    <div className="w-full h-full flex flex-col">
      <ChatInterface
        sessionId={sessionId}
        initialMessages={[]}
        userName={session?.user?.name}
        userImage={session?.user?.image}
      />
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      Failed to start chat session
    </div>
  )}
</div>
      </SidebarLayout>
    </AuthGuard>
  );
}
