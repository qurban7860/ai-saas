import { auth } from "@/auth";
import { chatService } from "@/features/chat/chat.service";
import { ChatMode } from "@/features/chat/config/ai.config";
import { sessionRateLimiter } from "@/features/chat/utils/rate-limiter";

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Authentication required",
            code: "UNAUTHORIZED",
            statusCode: 401,
          },
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const json = await req.json();
    const { messages, sessionId, chatMode = "DEFAULT" } = json;

    if (!sessionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Chat session ID is required",
            code: "MISSING_SESSION_ID",
            statusCode: 400,
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Messages array is required and cannot be empty",
            code: "INVALID_MESSAGES",
            statusCode: 400,
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== "user") {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Latest message must be from user",
            code: "INVALID_MESSAGE_SEQUENCE",
            statusCode: 400,
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const remaining = sessionRateLimiter.getRemaining(sessionId);
    const resetTime = sessionRateLimiter.getResetTime(sessionId);

    const response = await chatService.generateStreamingResponse(
      sessionId,
      session.user.id,
      latestMessage.content,
      (chatMode as ChatMode) || "DEFAULT"
    );

    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-RateLimit-Remaining", remaining.toString());
    newResponse.headers.set("X-RateLimit-Reset", resetTime.toString());

    return newResponse;
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
          statusCode: 500,
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
