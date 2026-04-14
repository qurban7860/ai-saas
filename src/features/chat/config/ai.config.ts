export const AI_CONFIG = {
  DEFAULT_MODEL: "gemini-2.5-flash",

  MODELS: {
    "gemini-2.5-flash": {
      name: "Gemini 2.5 Flash",
      description: "Latest fast model with improved performance",
      maxTokens: 8000,
      costPerMTok: 0.075, 
      contextWindow: 1000000,
    },
    "gemini-2.5-pro": {
      name: "Gemini 2.5 Pro",
      description: "Most capable model for complex tasks",
      maxTokens: 8000,
      costPerMTok: 3.5, 
      contextWindow: 1000000,
    },
    "gemini-2-flash": {
      name: "Gemini 2 Flash",
      description: "Fast and efficient for most tasks",
      maxTokens: 8000,
      costPerMTok: 0.075,
      contextWindow: 1000000,
    },
    "gemma-3-1b": {
      name: "Gemma 3 1B",
      description: "Lightweight model for efficient tasks",
      maxTokens: 8000,
      costPerMTok: 0.05,
      contextWindow: 1000000,
    }
  } as const,

  TEMPERATURE: {
    PRECISE: 0.3, 
    BALANCED: 0.7, 
    CREATIVE: 1.0,
  } as const,

  SYSTEM_PROMPTS: {
    DEFAULT:
      "You are a helpful, intelligent, and friendly AI assistant. Provide clear, concise, and accurate responses. When uncertain, acknowledge the limitation and offer alternatives. Format responses with clear structure and markdown when appropriate.",

    PROFESSIONAL:
      "You are a professional assistant designed for business communication. Provide accurate, formal, and structured responses. Focus on clarity, efficiency, and actionable insights. Use professional terminology.",

    CREATIVE:
      "You are a creative assistant that encourages imagination and explores ideas freely. Help users brainstorm, develop concepts, and think outside the box. Be engaging and inspiring while maintaining accuracy.",

    TECHNICAL:
      "You are a technical expert assistant. Provide detailed, accurate technical information with code examples when relevant. Explain complex concepts clearly and suggest best practices. Be precise and thorough.",

    TEACHING:
      "You are a patient educator. Break down complex topics into understandable parts. Use analogies and examples to explain concepts. Ask clarifying questions when needed. Encourage learning and curiosity.",
  } as const,

  RATE_LIMITS: {
    MAX_REQUESTS_PER_MINUTE: 60,
    MAX_REQUESTS_PER_HOUR: 3000,
    MAX_TOKENS_PER_HOUR: 1000000,
  } as const,

  TIMEOUTS: {
    API_CALL: 60000, 
    STREAM_CHUNK: 30000, 
  } as const,

  MESSAGE_LIMITS: {
    MAX_LENGTH: 10000,
    MIN_LENGTH: 1,
    MAX_HISTORY: 50, 
  } as const,
} as const;

export type ChatMode = keyof typeof AI_CONFIG.SYSTEM_PROMPTS;
export type ModelName = keyof typeof AI_CONFIG.MODELS;

export function getSystemPrompt(mode: ChatMode = "DEFAULT"): string {
  return AI_CONFIG.SYSTEM_PROMPTS[mode] || AI_CONFIG.SYSTEM_PROMPTS.DEFAULT;
}

export function getModelConfig(model: ModelName) {
  return AI_CONFIG.MODELS[model];
}

export function isValidMessageLength(content: string): boolean {
  const length = content.trim().length;
  return (
    length >= AI_CONFIG.MESSAGE_LIMITS.MIN_LENGTH &&
    length <= AI_CONFIG.MESSAGE_LIMITS.MAX_LENGTH
  );
}

export function sanitizeMessage(content: string): string {
  return content
    .trim()
    .substring(0, AI_CONFIG.MESSAGE_LIMITS.MAX_LENGTH);
}
