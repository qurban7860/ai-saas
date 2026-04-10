import prisma from "@/lib/prisma";

export const ChatRepository = {
  async createSession(userId: string, title?: string) {
    return prisma.chatSession.create({
      data: {
        userId,
        title: title || "New Chat",
      },
    });
  },

  async getSessionsByUser(userId: string) {
    return prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  },

  async getSessionById(sessionId: string, userId: string) {
    return prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },

  async deleteSession(sessionId: string, userId: string) {
    return prisma.chatSession.delete({
      where: {
        id: sessionId,
      },
    });
  },

  async addMessage(sessionId: string, role: string, content: string) {
    return prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role,
        content,
      },
    });
  },

  async getMessagesBySession(sessionId: string, userId: string) {
    // Validate ownership before grabbing messages
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) return null;

    return prisma.message.findMany({
      where: { chatSessionId: sessionId },
      orderBy: { createdAt: "asc" },
    });
  },
};
