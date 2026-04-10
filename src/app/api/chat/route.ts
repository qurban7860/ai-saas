import { auth } from "@/auth";
import { ChatService } from "@/features/chat/chat.service";

// Maximum execution time for edge functions (Vercel standard for AI)
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { messages, sessionId } = json;
    
    if (!sessionId) {
      return new Response("Chat session ID is required", { status: 400 });
    }

    // Extract the latest user message from the Vercel AI SDK incoming payload
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== "user") {
      return new Response("Invalid message sequence", { status: 400 });
    }

    // Invoke our Service Layer
    return await ChatService.generateStreamingResponse(
      sessionId,
      session.user.id,
      latestMessage.content
    );
  } catch (error) {
    console.error("AI Streaming Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
