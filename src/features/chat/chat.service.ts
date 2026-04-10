/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { ChatRepository } from "./chat.repository";

export const ChatService = {
  /**
   * Generates a streaming response using previous chat memory and saves the new input message.
   * Note: The actual saving of the *assistant's response* happens after the stream completes in Server Actions.
   */
  async generateStreamingResponse(
    sessionId: string,
    userId: string,
    content: string
  ) {
    // 1. Persist the user's incoming message via the repository layer
    await ChatRepository.addMessage(sessionId, "user", content);

    // 2. Fetch the entire chat history for AI memory
    const history = await ChatRepository.getMessagesBySession(sessionId, userId);

    if (!history) {
      throw new Error("Chat session not found or access denied.");
    }

    // 3. Map Prisma models to AI SDK message arrays
    const messages = history.map((msg: { role: string; content: any; }) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    // 4. Create the streaming text response using the provider (abstracting implementation)
    const result = streamText({
      model: openai("gpt-4o"),
      system: "You are a helpful and intelligent AI assistant. Provide concise and highly accurate answers.",
      messages,
      async onFinish({ text }) {
        // Automatically save the assistant's resulting message to the repository upon completion
        await ChatRepository.addMessage(sessionId, "assistant", text);
      },
    });

    return result.toTextStreamResponse();
  },
};
