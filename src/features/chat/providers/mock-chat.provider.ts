const DEMO_RESPONSES = [
  "That's a great question! Here's what I think about that topic:\n\nBased on my knowledge, this is an interesting area. The key points to consider are:\n\n1. **First Point**: This is important because...\n2. **Second Point**: From another perspective...\n3. **Third Point**: Additionally, you should know...\n\nLet me know if you'd like me to dive deeper into any of these points!",

  "I'd be happy to help with that!\n\nHere's a structured approach:\n\n```\nStep 1: Understand the problem\nStep 2: Break it down\nStep 3: Solve incrementally\nStep 4: Test and refine\n```\n\nThis methodology has proven effective for similar challenges. Do you want me to elaborate on any step?",

  "Great thinking! This relates to several important concepts:\n\n**Core Concepts:**\n- Concept A: Explanation\n- Concept B: Explanation  \n- Concept C: Explanation\n\n**Practical Applications:**\n1. Real-world example 1\n2. Real-world example 2\n3. Real-world example 3\n\nWould you like more specific examples?",

  "Excellent question! Here are the best practices:\n\n✓ **Best Practice 1**: Always consider...\n✓ **Best Practice 2**: Remember to...\n✓ **Best Practice 3**: Don't forget about...\n\n**Common Mistakes to Avoid:**\n- ❌ Mistake 1\n- ❌ Mistake 2\n- ❌ Mistake 3\n\nFollowing these guidelines will help you succeed!",

  "Let me break this down for you:\n\n**Analysis:**\nLooking at this from multiple angles:\n- Technical perspective: ...\n- Business perspective: ...\n- User perspective: ...\n\n**Recommendation:**\nBased on this analysis, I suggest:\n1. Start with...\n2. Then focus on...\n3. Finally, consider...\n\nThis approach balances all factors effectively.",
];

export class MockChatProvider {
  static getRandomResponse(): string {
    return DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
  }

  static async streamResponse(): Promise<ReadableStream<Uint8Array>> {
    const response = this.getRandomResponse();
    const encoder = new TextEncoder();

    return new ReadableStream({
      start(controller) {
        const chunkSize = 50;
        let index = 0;

        const sendNextChunk = () => {
          if (index < response.length) {
            const chunk = response.slice(index, index + chunkSize);
            controller.enqueue(encoder.encode(chunk));
            index += chunkSize;

            setTimeout(sendNextChunk, Math.random() * 100 + 50);
          } else {
            controller.close();
          }
        };

        sendNextChunk();
      },
    });
  }
}
