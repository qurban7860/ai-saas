/* eslint-disable @typescript-eslint/no-explicit-any */
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
    
    revalidatePath("/");
    return { success: true, chat };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getChatSessionsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const chats = await ChatRepository.getSessionsByUser(session.user.id);
    return { success: true, chats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getChatMessagesAction(chatId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const parsed = ChatIdSchema.parse({ chatId });
    const messages = await ChatRepository.getMessagesBySession(parsed.chatId, session.user.id);
    return { success: true, messages };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteChatSessionAction(chatId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const parsed = ChatIdSchema.parse({ chatId });
    await ChatRepository.deleteSession(parsed.chatId, session.user.id);
    
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
