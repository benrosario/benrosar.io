import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatMessageContent } from "../components/chat-message.ts";

const render = (content, role = "assistant") => renderToStaticMarkup(createElement(ChatMessageContent, { role, content }));

test("assistant replies format course details, line breaks, links, lists, and code", () => {
  const html = render("### **CSCI 12**\n*Online*\n~~Closed~~ Open\n\n- Monday\n- Wednesday\n\n1. Check schedule\n2. [Enroll](https://www.sierracollege.edu/)\n\n> Verify availability\n\n`CSCI`\n\n```text\n**literal**\n```\n\n| Course | Units |\n| --- | --- |\n| CSCI 12 | 3 |");
  for (const tag of ["strong", "em", "del", "br", "ul", "ol", "blockquote", "code", "pre", "table", "th", "td"]) {
    assert.match(html, new RegExp(`<${tag}[ >/]`));
  }
  assert.match(html, /href="https:\/\/www.sierracollege.edu\/" target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /\*\*literal\*\*/);
});

test("model output cannot inject HTML, load images, or create executable links", () => {
  const html = render('<script>alert(1)</script>\n\n<img src="https://example.test/pixel" onerror="alert(1)">\n\n![tracking](https://example.test/image)\n\n[unsafe](javascript:alert%281%29) [data](data:text/html,bad) [safe](https://www.sierracollege.edu/)');
  assert.doesNotMatch(html, /<script|<img|onerror=|href="(?:javascript:|data:)/);
  assert.match(html, /<span>unsafe<\/span>/);
  assert.match(html, /href="https:\/\/www.sierracollege.edu\/"/);
});

test("user messages remain literal plain text", () => {
  const html = render("**CSCI** <script>alert(1)</script>", "user");
  assert.match(html, /\*\*CSCI\*\*/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<strong>|<script>|chat-markdown/);
});
