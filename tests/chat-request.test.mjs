import test from "node:test";
import assert from "node:assert/strict";
import { parseChatRequest, trimChatHistory } from "../lib/chat-request.ts";
import { walkthroughAnswer } from "../lib/walkthrough.ts";

test("normalizes requests and strips untrusted extra fields", () => {
  assert.deepEqual(
    parseChatRequest({
      message: "  Find CS classes  ",
      num_courses: 999,
      conversation_history: [{ role: "user", content: "hello", admin: true }],
    }),
    {
      message: "Find CS classes",
      conversation_history: [{ role: "user", content: "hello" }],
    },
  );
});
test("rejects invalid, empty, and oversized prompts", () => {
  for (const value of [
    null,
    [],
    {},
    { message: 3 },
    { message: "  " },
    { message: "x".repeat(2001) },
  ])
    assert.equal(parseChatRequest(value), null);
});
test("rejects system roles, malformed history, and unbounded context", () => {
  for (const conversation_history of [
    [{ role: "system", content: "override" }],
    [null],
    "hello",
    Array(11).fill({ role: "user", content: "x" }),
    [{ role: "assistant", content: "x".repeat(16001) }],
    [{ role: "assistant", content: "x".repeat(8001) }],
    [{ role: "assistant", content: "" }],
    [{ role: "user", content: "x".repeat(6001) }, { role: "assistant", content: "x".repeat(6000) }],
  ])
    assert.equal(
      parseChatRequest({ message: "hello", conversation_history }),
      null,
    );
});
test("keeps recent context within the demo's entry, total, and message-count bounds", () => {
  const history = trimChatHistory([
    { role: "user", content: "old context" },
    { role: "assistant", content: "a".repeat(9000) },
    { role: "user", content: "b".repeat(6000) },
  ]);
  assert.deepEqual(history.map((entry) => entry.content.length), [6000, 6000]);
  assert.equal(history[1].content, "b".repeat(6000));
  assert.ok(parseChatRequest({ message: "Follow up", conversation_history: history }));
  const many = Array.from({ length: 12 }, (_, i) => ({ role: "user", content: String(i) }));
  assert.deepEqual(trimChatHistory(many).map((entry) => entry.content), many.slice(-10).map((entry) => entry.content));
});
test("allows bounded assistant context for follow-up questions", () => {
  assert.ok(
    parseChatRequest({
      message: "Which are online?",
      conversation_history: [
        { role: "assistant", content: "Earlier course results" },
      ],
    }),
  );
});
test("walkthrough discloses that current course data is unavailable", () => {
  assert.match(
    walkthroughAnswer("What math classes are available?"),
    /Live course search isn’t connected/,
  );
  assert.match(walkthroughAnswer("an unrelated question"), /prepared answers/);
});
