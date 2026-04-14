"use server";

import { auth } from "@/auth";
import { ChatRepository } from "./chat.repository";
import { revalidatePath } from "next/cache";
import { CreateChatSessionSchema, ChatIdSchema } from "./chat.dto";

export async function createChatSessionAction(title?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const parsed = CreateChatSessionSchema.parse({ title });
    const chat = await ChatRepository.createSession(session.user.id, parsed.title);
    
    revalidatePath("/", "layout");
    return { success: true, chat };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create chat session" };
  }
}

export async function getChatSessionsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const chats = await ChatRepository.getSessionsWithPreview(session.user.id);
    return { success: true, chats };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch chat sessions" };
  }
}

export async function getChatMessagesAction(chatId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const parsed = ChatIdSchema.parse({ chatId });
    const messages = await ChatRepository.getMessagesBySession(parsed.chatId, session.user.id);
    return { success: true, messages };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch messages" };
  }
}

export async function deleteChatSessionAction(chatId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const parsed = ChatIdSchema.parse({ chatId });
    await ChatRepository.deleteSession(parsed.chatId, session.user.id);
    
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete session" };
  }
}