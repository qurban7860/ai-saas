import prisma from "@/lib/prisma";

export interface Message {
  id: string;
  role: string;
  content: string;
  chatSessionId: string;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export class ChatRepository {
  static async createSession(
    userId: string,
    title: string = "New Chat"
  ): Promise<ChatSession> {
    return prisma.chatSession.create({
      data: {
        userId,
        title,
      },
    }) as Promise<ChatSession>;
  }

  static async getSessionsByUser(userId: string): Promise<ChatSession[]> {
    return prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }) as Promise<ChatSession[]>;
  }

  static async getSessionById(
    sessionId: string,
    userId: string
  ): Promise<ChatSession | null> {
    return prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    }) as Promise<ChatSession | null>;
  }

  static async getMessagesBySession(
    sessionId: string,
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<Message[] | null> {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) return null;

    return prisma.message.findMany({
      where: { chatSessionId: sessionId },
      orderBy: { createdAt: "asc" },
      ...(limit && { take: limit }),
      ...(offset && { skip: offset }),
    }) as Promise<Message[]>;
  }

  static async addMessage(
    sessionId: string,
    role: string,
    content: string
  ): Promise<Message> {
    return prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role,
        content,
      },
    }) as Promise<Message>;
  }

  static async deleteSession(
    sessionId: string,
    userId: string
  ): Promise<ChatSession> {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error("Chat session not found or access denied");
    }

    return prisma.chatSession.delete({
      where: { id: sessionId },
    }) as Promise<ChatSession>;
  }

  static async updateSessionTitle(
    sessionId: string,
    userId: string,
    title: string
  ): Promise<ChatSession> {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error("Chat session not found or access denied");
    }

    return prisma.chatSession.update({
      where: { id: sessionId },
      data: { title },
    }) as Promise<ChatSession>;
  }

  static async clearSessionMessages(
    sessionId: string,
    userId: string
  ): Promise<void> {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new Error("Chat session not found or access denied");
    }
    await prisma.message.deleteMany({
      where: { chatSessionId: sessionId },
    });
  }

  static async getMessageCount(
    sessionId: string,
    userId: string
  ): Promise<number> {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new Error("Chat session not found or access denied");
    }
    return prisma.message.count({
      where: { chatSessionId: sessionId },
    });
  }
};
