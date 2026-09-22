import { createElement } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

const components: Components = {
  a: ({ href, children }) => href
    ? createElement("a", { href, target: "_blank", rel: "noopener noreferrer" }, children)
    : createElement("span", null, children),
  table: ({ children }) => createElement("div", { className: "chat-table-scroll", tabIndex: 0, role: "region", "aria-label": "Course comparison table" },
    createElement("table", null, children)),
};

export function ChatMessageContent({ role, content }: { role: "user" | "assistant"; content: string }) {
  return createElement("div", { className: role === "assistant" ? "message-bubble chat-markdown" : "message-bubble" },
    role === "user" ? content : createElement(Markdown, {
      remarkPlugins: [remarkGfm, remarkBreaks],
      skipHtml: true,
      // Answers are untrusted: no embedded media, HTML, or executable URLs.
      allowedElements: ["p", "br", "strong", "em", "del", "a", "ul", "ol", "li", "blockquote", "code", "pre", "hr", "h1", "h2", "h3", "h4", "h5", "h6", "table", "thead", "tbody", "tr", "th", "td"],
      urlTransform: (url) => /^https?:\/\//i.test(url) ? url : "",
      components,
    }, content));
}
