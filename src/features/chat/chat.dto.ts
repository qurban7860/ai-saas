import { z } from "zod";

export const CreateChatSessionSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(100, "Title is too long")
    .optional(),
});

export const ChatIdSchema = z.object({
  chatId: z.string().cuid("Invalid Chat ID format"),
});

export const SendMessageSchema = z.object({
  sessionId: z.string().cuid("Invalid Chat Session ID formatting"),
  content: z.string().min(1, "Message content cannot be empty"),
});

// Infer types correctly for feature scaling
export type CreateChatSessionDTO = z.infer<typeof CreateChatSessionSchema>;
export type ChatIdDTO = z.infer<typeof ChatIdSchema>;
export type SendMessageDTO = z.infer<typeof SendMessageSchema>;
