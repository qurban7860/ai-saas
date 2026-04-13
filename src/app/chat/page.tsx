"use client";

import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
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
      <DashboardLayout>
        <div className="w-full h-full flex flex-col px-4 py-6 lg:px-8 lg:py-8">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 bg-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-400">Starting chat session...</p>
              </div>
            </div>
          ) : sessionId ? (
            <div className="mx-auto w-full max-w-6xl flex-1">
              <ChatInterface
                sessionId={sessionId}
                initialMessages={[]}
                userName={session?.user?.name}
                userImage={session?.user?.image}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-zinc-400">Failed to start chat session</p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
