/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import {
  IAIProvider,
  AIMessage,
  AIProviderConfig,
  AIProviderError,
} from "../types/ai-provider";

export class GoogleAIProvider implements IAIProvider {
  private config: AIProviderConfig;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(
    private apiKey: string,
    model: string = "gemini-2.0-flash",
    temperature: number = 0.7,
    maxTokens: number = 2048
  ) {
    this.config = {
      apiKey,
      model: this.normalizeModelId(model),
      temperature,
      maxTokens,
      topP: 0.9,
      topK: 40,
    };
  }

  private normalizeModelId(model: string): string {
    const normalized = model.trim();

    const displayToId: Record<string, string> = {
      "Gemini 2.5 Flash": "gemini-2.5-flash",
      "Gemini 2.5 Pro": "gemini-2.5-pro",
      "Gemini 2 Flash": "gemini-2-flash",
      "Gemma 3 1B": "gemma-3-1b",
      "gemini 2.5 flash": "gemini-2.5-flash",
      "gemini 2.5 pro": "gemini-2.5-pro",
      "gemini 2 flash": "gemini-2-flash",
      "gemma 3 1b": "gemma-3-1b",
    };

    return displayToId[normalized] ?? normalized;
  }

  async streamGenerate(
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      await this.validateConfig();

      const formattedMessages = messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: String(msg.content),
      }));

      const result = streamText({
        model: google(this.config.model),
        system: systemPrompt,
        messages: formattedMessages as any,
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topP: this.config.topP,
        topK: this.config.topK,
      });

      return result.toTextStreamResponse().body!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateConfig(): Promise<boolean> {
    if (!this.apiKey) {
      throw new AIProviderError(
        "Google Generative AI API key is missing",
        "MISSING_API_KEY",
        400
      );
    }

    if (!this.config.model) {
      throw new AIProviderError(
        "AI model is not configured",
        "MISSING_MODEL",
        400
      );
    }

    return true;
  }

  async getAvailableModels(): Promise<string[]> {
    return [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2-flash",
      "gemma-3-1b",
    ];
  }

  private isRetryableError(error: any): boolean {
    const retryableStatus = [429, 500, 502, 503, 504];
    const retryableCodes = ["ETIMEDOUT", "ECONNRESET", "RATE_LIMIT_EXCEEDED"];
    
    if (error?.message?.includes("quota") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      return false;
    }
    
    return (
      retryableStatus.includes(error?.statusCode) ||
      error?.isRetryable === true ||
      retryableCodes.includes(error?.code)
    );
  }

  private handleError(error: any): AIProviderError {
    const statusCode = error?.statusCode || 500;
    const message = error?.message || "Unknown AI provider error";

    if (
      message.includes("quota") ||
      message.includes("Quota exceeded") ||
      message.includes("free_tier")
    ) {
      return new AIProviderError(
        "API quota exceeded. Please upgrade your plan or try again later.",
        "QUOTA_EXCEEDED",
        429,
        error
      );
    }

    if (message.includes("models/gemini-1.5-flash is not found")) {
      return new AIProviderError(
        "Gemini 1.5 Flash model is not available. Using Gemini 2.0 Flash instead.",
        "MODEL_NOT_FOUND",
        404,
        error
      );
    }

    if (message.includes("API key is invalid")) {
      return new AIProviderError(
        "Invalid Google API key",
        "INVALID_API_KEY",
        401,
        error
      );
    }

    if (message.includes("RESOURCE_EXHAUSTED")) {
      return new AIProviderError(
        "API resource limit exceeded. Please try again later.",
        "RESOURCE_EXHAUSTED",
        429,
        error
      );
    }

    return new AIProviderError(
      message,
      error?.code || "AI_PROVIDER_ERROR",
      statusCode,
      error
    );
  }
}
