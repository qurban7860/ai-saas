/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleAIProvider } from "./providers/google-ai.provider";
import { MockChatProvider } from "./providers/mock-chat.provider";
import { ChatRepository, Message } from "./chat.repository";
import { env } from "@/lib/env";
import {
  getSystemPrompt,
  sanitizeMessage,
  isValidMessageLength,
  AI_CONFIG,
  ChatMode,
} from "./config/ai.config";
import { AIProviderError } from "./types/ai-provider";
import { sessionRateLimiter } from "./utils/rate-limiter";

export interface ChatResponse {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code: string;
    statusCode?: number;
  };
}

export class ChatService {
  private aiProvider: GoogleAIProvider;
  private messageBuffer: Map<string, Message[]> = new Map();
  private quotaExceeded: boolean = false;
  private quotaResetTime: Date | null = null;

  constructor(
    apiKey: string = env.GOOGLE_GENERATIVE_AI_API_KEY,
    model: string = AI_CONFIG.DEFAULT_MODEL
  ) {
    this.aiProvider = new GoogleAIProvider(apiKey, model);
  }

  async generateStreamingResponse(
    sessionId: string,
    userId: string,
    userMessage: string,
    chatMode: ChatMode = "DEFAULT"
  ): Promise<Response> {
    try {
      if (!sessionRateLimiter.isAllowed(sessionId)) {
        const resetTime = sessionRateLimiter.getResetTime(sessionId);
        throw new AIProviderError(
          `Rate limit exceeded. Please wait ${resetTime} seconds before trying again.`,
          "RATE_LIMIT_EXCEEDED",
          429
        );
      }
      this.validateInputs(sessionId, userId, userMessage);
      const sanitizedMessage = sanitizeMessage(userMessage);
      await ChatRepository.addMessage(sessionId, "user", sanitizedMessage);
      this.clearSessionCache(sessionId);

      const history = await this.getConversationContext(sessionId, userId);

      if (!history) {
        throw new AIProviderError(
          "Chat session not found or access denied",
          "SESSION_NOT_FOUND",
          404
        );
      }

      const systemPrompt = getSystemPrompt(chatMode);
      let stream: ReadableStream<Uint8Array>;
      let isDemo = false;

      try {
        stream = await this.aiProvider.streamGenerate(history, systemPrompt);
      } catch (error: any) {
        if (
          error?.code === "QUOTA_EXCEEDED" ||
          error?.statusCode === 429
        ) {
          this.quotaExceeded = true;
          this.quotaResetTime = new Date(Date.now() + 60 * 60 * 1000); 
          stream = await MockChatProvider.streamResponse();
          isDemo = true;
          console.warn(
            "⚠️ API quota exceeded, using demo mode for responses",
            error
          );
        } else {
          throw error;
        }
      }

      return this.createStreamedResponse(stream, sessionId, isDemo);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async getConversationContext(
    sessionId: string,
    userId: string
  ): Promise<Array<{ role: "user" | "assistant"; content: string }> | null> {
    try {
      if (this.messageBuffer.has(sessionId)) {
        const cachedMessages = this.messageBuffer.get(sessionId);
        if (cachedMessages) {
          return cachedMessages.map((msg) => ({
            role: (msg.role === "assistant"
              ? "assistant"
              : "user") as "user" | "assistant",
            content: msg.content,
          }));
        }
      }

      const messages = await ChatRepository.getMessagesBySession(
        sessionId,
        userId,
        AI_CONFIG.MESSAGE_LIMITS.MAX_HISTORY
      );

      if (!messages) return null;

      this.messageBuffer.set(sessionId, messages);

      if (this.messageBuffer.size > 100) {
        const firstKey = Array.from(this.messageBuffer.keys())[0];
        if (firstKey) {
          this.messageBuffer.delete(firstKey);
        }
      }

      return messages.map((msg) => ({
        role: (msg.role === "assistant"
          ? "assistant"
          : "user") as "user" | "assistant",
        content: msg.content,
      }));
    } catch (error) {
      console.error("Error fetching conversation context:", error);
      return null;
    }
  }

  private createStreamedResponse(
    stream: ReadableStream<Uint8Array>,
    sessionId: string,
    isDemo: boolean = false
  ): Response {
    let fullResponse = "";
    const self = this;

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        try {
          const text = new TextDecoder().decode(chunk);
          fullResponse += text;

          controller.enqueue(chunk);
        } catch (error) {
          console.error("Error in stream transform:", error);
          controller.error(error);
        }
      },

      async flush(controller) {
        try {
          if (fullResponse.trim()) {
            await ChatRepository.addMessage(
              sessionId,
              "assistant",
              fullResponse +
                (isDemo ? "\n\n**(This is a demo response - API quota exceeded)**" : "")
            );
            self.clearSessionCache(sessionId);
          }
        } catch (error) {
          console.error("Error saving response:", error);
        }
      },
    });

    return new Response(stream.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Demo-Mode": isDemo ? "true" : "false",
        ...(this.quotaResetTime && {
          "X-Quota-Reset": this.quotaResetTime.toISOString(),
        }),
      },
    });
  }

  private validateInputs(
    sessionId: string,
    userId: string,
    message: string
  ): void {
    if (!sessionId || !sessionId.trim()) {
      throw new AIProviderError(
        "Chat session ID is required",
        "MISSING_SESSION_ID",
        400
      );
    }

    if (!userId || !userId.trim()) {
      throw new AIProviderError("User ID is required", "MISSING_USER_ID", 400);
    }

    if (!message || !message.trim()) {
      throw new AIProviderError(
        "Message content cannot be empty",
        "EMPTY_MESSAGE",
        400
      );
    }

    if (!isValidMessageLength(message)) {
      throw new AIProviderError(
        `Message must be between ${AI_CONFIG.MESSAGE_LIMITS.MIN_LENGTH} and ${AI_CONFIG.MESSAGE_LIMITS.MAX_LENGTH} characters`,
        "INVALID_MESSAGE_LENGTH",
        400
      );
    }
  }

  private handleError(error: any): Response {
    console.error("Chat Service Error:", error);

    if (error instanceof AIProviderError) {
      const statusCode = error.statusCode || 500;
      const isQuotaError = error.code === "QUOTA_EXCEEDED";

      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode,
            ...(isQuotaError && {
              suggestedAction: "Please upgrade your plan or try again later",
              learnMore: "https://ai.google.dev/gemini-api/docs/rate-limits",
            }),
          },
          demo: isQuotaError, 
        }),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const statusCode = error?.statusCode || 500;
    const message =
      error?.message || "An unexpected error occurred during chat processing";

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message,
          code: "CHAT_ERROR",
          statusCode,
        },
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  getQuotaStatus(): {
    exceeded: boolean;
    resetTime: Date | null;
  } {
    return {
      exceeded: this.quotaExceeded,
      resetTime: this.quotaResetTime,
    };
  }

  clearCache(): void {
    this.messageBuffer.clear();
  }

  clearSessionCache(sessionId: string): void {
    this.messageBuffer.delete(sessionId);
  }
}

export const chatService = new ChatService();