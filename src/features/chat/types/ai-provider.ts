export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIProviderConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface AIStreamResponse {
  text: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface IAIProvider {
  streamGenerate(
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<ReadableStream<Uint8Array>>;

  validateConfig(): Promise<boolean>;
  getAvailableModels(): Promise<string[]>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public cause?: Error
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}
