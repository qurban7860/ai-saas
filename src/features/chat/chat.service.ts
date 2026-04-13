/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { ChatRepository } from "./chat.repository";
import { env } from "@/lib/env";

export const ChatService = {
  async generateStreamingResponse(
    sessionId: string,
    userId: string,
    content: string
  ) {
    await ChatRepository.addMessage(sessionId, "user", content);

    const history = await ChatRepository.getMessagesBySession(sessionId, userId);

    if (!history) {
      throw new Error("Chat session not found or access denied.");
    }

    const messages = history.map((msg: { role: string; content: any; }) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    if (!env.GEMINI_API_KEY) {
      throw new Error(
        "OpenAI API key is missing. Set GEMINI_API_KEY in your environment variables to enable chat responses."
      );
    }

    const result = streamText({
      model: openai("gpt-4o"),

      system: "You are a helpful and intelligent AI assistant. Provide concise and highly accurate answers.",
      messages,
      async onFinish({ text }) {
        await ChatRepository.addMessage(sessionId, "assistant", text);
      },
    });

    return result.toTextStreamResponse();
  },
};
