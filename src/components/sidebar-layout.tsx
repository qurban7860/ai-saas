"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Trash2, MessageCircle, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { createChatSessionAction, getChatSessionsAction, deleteChatSessionAction } from "@/features/chat/chat.actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatSessionPreview {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  preview?: string;
  messageCount: number;
}

const ChatSessionItem = ({ 
  chat, 
  isActive, 
  onSelect, 
  onDelete 
}: { 
  chat: ChatSessionPreview; 
  isActive: boolean; 
  onSelect: (id: string) => void; 
  onDelete: (id: string, e: React.MouseEvent) => void;
}) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric'
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(chat.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(chat.id);
        }
      }}
      className={`w-full p-3 rounded-lg text-left transition-all hover:bg-accent relative group flex flex-col gap-1 cursor-pointer
        ${isActive ? 'bg-primary/10 border-r-2 border-primary text-primary font-medium' : 'hover:bg-accent/70'}`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex-1 min-w-0 pr-6">
          <p className="font-medium truncate text-sm leading-tight">
            {chat.title !== 'New Chat' ? chat.title : chat.preview || 'New Chat'}
          </p>
        </div>
        <div className="text-xs text-muted-foreground ml-2 flex-shrink-0 bg-secondary/50 px-1.5 py-0.5 rounded-full">
          {chat.messageCount}
        </div>
      </div>
      <p className="text-xs text-muted-foreground truncate w-full">
        {formatTime(chat.updatedAt)}
      </p>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(chat.id, e);
        }}
        className="opacity-0 group-hover:opacity-100 absolute right-2 top-2.5 p-1.5 rounded-full hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-all duration-200 cursor-pointer"
        title="Delete conversation"
        aria-label="Delete chat"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export function SidebarLayout({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const [chats, setChats] = useState<ChatSessionPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSessionId = searchParams.get('sessionId');

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getChatSessionsAction();
      if (result.success) setChats(result.chats || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleNewChat = async () => {
    setCreating(true);
    try {
      const result = await createChatSessionAction();
      if (result.success && result.chat) {
        router.push(`/chat?sessionId=${result.chat.id}`);
        await loadChats();
        if (window.innerWidth < 1024) setOpen(false);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    router.push(`/chat?sessionId=${chatId}`);
    if (window.innerWidth < 1024) setOpen(false);
  };

  const triggerDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chatId);
  };

  const executeDeleteChat = async () => {
    if (!chatToDelete) return;
    const targetId = chatToDelete;
    setChatToDelete(null);
    setChats(prev => prev.filter(c => c.id !== targetId));

    try {
      const result = await deleteChatSessionAction(targetId);
      if (!result.success) throw new Error("Delete failed server-side");
      if (currentSessionId === targetId) router.push('/chat');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      loadChats();
    }
  };

  return (
    <TooltipProvider delay={400}>
      <div className="h-screen w-full overflow-hidden bg-background text-foreground flex flex-col">
        {open && (
          <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity" />
        )}
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <aside className={`
            fixed lg:static z-50 h-full bg-card border-r border-border shadow-lg transition-all duration-300 ease-in-out
            ${open ? "translate-x-0 w-[300px]" : "-translate-x-full lg:translate-x-0"}
            ${isCollapsed ? "lg:w-0 lg:opacity-0 lg:invisible" : "lg:w-[320px] lg:opacity-100"}
          `}>
            <div className="h-full flex flex-col overflow-hidden w-[320px]">
              <div className="p-4 border-b border-border sticky top-0 bg-card/95 backdrop-blur z-10">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h2 className="text-lg font-semibold tracking-tight truncate">Conversations</h2>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setIsCollapsed(true)} 
                          className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <span className="sr-only">Close sidebar</span>
                          <PanelLeftClose className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Close sidebar</TooltipContent>
                    </Tooltip>
                    <Button onClick={handleNewChat} disabled={creating} size="sm" className="gap-2 h-8 px-3 shadow-sm cursor-pointer">
                      {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">New</span>
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 h-full">
                {loading ? (
                  <div className="p-8 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm">Loading history...</span>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-medium mb-1 text-foreground">No conversations yet</p>
                    <p className="text-xs">Create a new chat to get started</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {chats.map((chat) => (
                      <ChatSessionItem
                        key={chat.id}
                        chat={chat}
                        isActive={currentSessionId === chat.id}
                        onSelect={handleSelectChat}
                        onDelete={triggerDeleteChat}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </aside>

          <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col relative bg-background/50">
            <div className={`hidden lg:flex absolute left-4 top-4 z-40 transition-opacity duration-300 ${isCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <Tooltip>
                <TooltipTrigger>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setIsCollapsed(false)} 
                    className="h-9 w-9 rounded-lg bg-background/80 backdrop-blur shadow-sm border-border hover:bg-accent cursor-pointer"
                  >
                    <span className="sr-only">Open sidebar</span>
                    <PanelLeftOpen className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Open sidebar</TooltipContent>
              </Tooltip>
            </div>
            <div className="lg:hidden p-3 border-b border-border bg-card flex items-center shadow-sm shrink-0">
              <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="w-9 h-9 mr-3 cursor-pointer">
                <Menu className="w-5 h-5" />
              </Button>
              <span className="font-semibold text-sm">Menu</span>
            </div>
            <div className="flex-1 overflow-hidden relative flex flex-col">
              {children}
            </div>
          </main>
        </div>

        <AlertDialog open={!!chatToDelete} onOpenChange={(isOpen) => !isOpen && setChatToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your chat history and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={executeDeleteChat}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}