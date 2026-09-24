import { parseChatRequest } from "@/lib/chat-request";
export const runtime = "nodejs";
export const maxDuration = 60;
const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });

function validateHeaders(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    let sameHost = false;
    try {
      const source = new URL(origin);
      sameHost = (source.protocol === "https:" || source.protocol === "http:") &&
        source.host === request.headers.get("host")?.toLowerCase();
    } catch { /* Reject malformed and opaque origins. */ }
    if (!sameHost) return json({ error: "Please send your message from this website." }, 403);
  }
  const authorization = request.headers.get("authorization") ?? "";
  // Only bound and forward the token here. The Sierra API verifies Google's
  // signature, audience, expiry and subject before reserving a quota slot.
  if (!/^Bearer [\x21-\x7e]{1,8192}$/i.test(authorization))
    return json({ error: "Sign in with Google to try the demo.", code: "sign_in_required" }, 401);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ error: "Expected a JSON message." }, 415);
  return null;
}

export async function POST(request: Request) {
  const rejection = validateHeaders(request);
  // Consume bounded request bodies even when rejecting their headers. Returning
  // with an unread body can break the Workers proxy's next pooled request.
  // Keep header errors first and never parse or forward rejected messages.
  let raw = "";
  try {
    const reader = request.body?.getReader();
    if (!reader) return rejection ?? json({ error: "A message is required." }, 400);
    const decoder = new TextDecoder();
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 65536) {
        await reader.cancel();
        return rejection ?? json({ error: "This conversation is too long. Start a new conversation." }, 413);
      }
      if (!rejection) raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  } catch {
    return rejection ?? json({ error: "Unable to read your message." }, 400);
  }
  if (rejection) return rejection;
  let body;
  try { body = parseChatRequest(JSON.parse(raw)); }
  catch { return json({ error: "Invalid message format." }, 400); }
  if (!body) return json({ error: "Use a message of up to 2,000 characters and a shorter conversation history." }, 400);
  const base = process.env.SIERRA_API_URL;
  if (!base) return json({ error: "The live demo is not available yet." }, 503);
  try {
    const url = new URL(`${base.replace(/\/$/, "")}/demo/chat`);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)))
      return json({ error: "The live demo is not available yet." }, 503);
    const response = await fetch(url, {
      method: "POST",
      // Never forward caller-selected identities, cookies, or bot credentials.
      headers: { "Content-Type": "application/json", Authorization: request.headers.get("authorization")! },
      body: JSON.stringify({ ...body, num_courses: 3 }),
      cache: "no-store",
      credentials: "omit",
      // Workers supports manual redirects; never forward the bearer token to
      // a redirected destination, even if the upstream changes its location.
      redirect: "manual",
      signal: AbortSignal.timeout(50000),
    });
    if (response.status === 401)
      return json({ error: "Your sign-in expired or could not be verified. Sign in with Google again.", code: "sign_in_required" }, 401);
    const data = await response.json().catch(() => null);
    if (response.status === 429) {
      switch (data?.detail?.code) {
        case "demo_limit_reached":
          return json({ error: "You’ve used all three demo attempts for this Google account.", code: "demo_limit_reached", messages_remaining: 0 }, 429);
        case "demo_daily_limit_reached":
          return json({ error: "The demo has reached today’s capacity. Try again after midnight UTC.", code: "demo_daily_limit_reached" }, 429);
        case "demo_auth_rate_limited": {
          const retry = response.headers.get("retry-after");
          const headers: Record<string, string> = retry && /^\d{1,4}$/.test(retry) ? { "Retry-After": retry } : {};
          return json({ error: "Too many sign-in requests. Please wait a minute before trying again.", code: "demo_auth_rate_limited" }, 429, headers);
        }
        default:
          return json({ error: "The demo is busy. Please try again later.", code: "rate_limited" }, 429);
      }
    }
    if (response.status === 413 || response.status === 422)
      return json({ error: "The request was too long or invalid. Shorten your message or start a new conversation." }, response.status);
    if (!response.ok)
      return json({ error: "The course service is temporarily unavailable. This attempt may still count toward your allowance.", code: "attempt_uncertain" }, response.status === 503 ? 503 : 502);
    if (typeof data?.response !== "string" || !data.response.trim() ||
        !Number.isInteger(data.messages_remaining) || data.messages_remaining < 0 || data.messages_remaining > 2)
      return json({ error: "The service returned an incomplete answer. This attempt may still count toward your allowance.", code: "attempt_uncertain" }, 502);
    return json({
      response: data.response,
      courses_searched: Number.isInteger(data.courses_searched) ? data.courses_searched : null,
      data_updated_at: typeof data.data_updated_at === "string" ? data.data_updated_at : null,
      messages_remaining: data.messages_remaining,
    });
  } catch {
    return json({ error: "The connection ended before an answer arrived. This attempt may still count toward your allowance; messages are never retried automatically.", code: "attempt_uncertain" }, 502);
  }
}
