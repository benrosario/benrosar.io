export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatRequest = {
  message: string;
  conversation_history: ChatMessage[];
};
export function parseChatRequest(value: unknown): ChatRequest | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (
    typeof body.message !== "string" ||
    !body.message.trim() ||
    body.message.length > 2000
  )
    return null;
  const history = body.conversation_history ?? [];
  if (!Array.isArray(history) || history.length > 10) return null;
  if (
    !history.every(
      (item) =>
        item &&
        typeof item === "object" &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.length > 0 &&
        item.content.length <= 8000,
    )
  )
    return null;
  if (history.reduce((total, item) => total + item.content.length, 0) > 12000)
    return null;
  return {
    message: body.message.trim(),
    conversation_history: history.map(({ role, content }) => ({
      role,
      content,
    })),
  };
}

// Keep the most recent context within the demo API's per-entry and total limits.
export function trimChatHistory(messages: ChatMessage[]): ChatMessage[] {
  const result: ChatMessage[] = [];
  let remaining = 12000;
  for (const message of messages.slice(-10).reverse()) {
    if (!remaining) break;
    const content = message.content.slice(-Math.min(8000, remaining));
    if (!content) continue;
    result.unshift({ role: message.role, content });
    remaining -= content.length;
  }
  return result;
}
