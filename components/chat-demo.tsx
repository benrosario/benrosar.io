"use client";
import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { trimChatHistory, type ChatMessage } from "@/lib/chat-request";
import { Arrow, Mountain } from "./icons";
import { ChatMessageContent } from "./chat-message";

type GoogleIdentity = {
  initialize: (options: { client_id: string; callback: (result: { credential: string }) => void; auto_select: boolean }) => void;
  renderButton: (element: HTMLElement, options: { theme: string; size: string; width: number }) => void;
  disableAutoSelect: () => void;
};
declare global {
  interface Window { google?: { accounts: { id: GoogleIdentity } } }
}

// Runtime configuration keeps the overview intact until both services are ready.
// One request per page load, shared by the demo and the button that links to it.
let demoConfig: Promise<string | null> | null = null;
function loadDemoClientId() {
  demoConfig ??= fetch("/api/demo/config", { cache: "no-store", credentials: "omit" })
    .then(async (response) => response.ok ? response.json() : null)
    .then((data) => typeof data?.google_client_id === "string" ? data.google_client_id as string : null)
    .catch(() => null); // The project overview remains usable if configuration is unavailable.
  return demoConfig;
}
function useDemoClientId() {
  const [clientId, setClientId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void loadDemoClientId().then((id) => { if (active) setClientId(id); });
    return () => { active = false; };
  }, []);
  return clientId;
}

export function LiveDemo() {
  const clientId = useDemoClientId();
  return clientId ? <ChatDemo googleClientId={clientId} /> : null;
}

// Shown only when the live demo is available, so it never links to nothing.
export function LiveDemoLink() {
  const clientId = useDemoClientId();
  if (!clientId) return null;
  return (
    <div className="demo-link">
      <a className="button primary" href="#live-demo">
        Try the live demo <Arrow direction="down" />
      </a>
      <p>Sign in with Google. Three questions per account.</p>
    </div>
  );
}

export function ChatDemo({ googleClientId }: { googleClientId: string }) {
  const [loadGoogle, setLoadGoogle] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const token = useRef<string | null>(null);
  const busyRef = useRef(false);
  const mounted = useRef(true);
  const controller = useRef<AbortController | null>(null);
  const googleButton = useRef<HTMLDivElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; token.current = null; controller.current?.abort(); };
  }, []);
  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [messages, busy]);

  function initializeGoogle() {
    const identity = window.google?.accounts.id;
    if (!identity || !googleButton.current) {
      setError("Google sign-in could not load. Please reload the page to try again.");
      return;
    }
    identity.initialize({
      client_id: googleClientId,
      auto_select: false,
      callback: ({ credential }) => {
        if (!mounted.current || busyRef.current || !credential) return;
        token.current = credential;
        setSignedIn(true);
        // A new account must never inherit another account's conversation or quota.
        setMessages([]); setInput(""); setRemaining(null); setUpdatedAt(null);
        setError(""); setPaused(false);
      },
    });
    identity.renderButton(googleButton.current, { theme: "outline", size: "large", width: 240 });
    setGoogleReady(true);
  }
  function signOut() {
    token.current = null;
    window.google?.accounts.id.disableAutoSelect();
    setSignedIn(false); setMessages([]); setInput(""); setRemaining(null);
    setError(""); setUpdatedAt(null); setPaused(false);
  }
  function resetConversation() {
    setMessages([]); setInput(""); setUpdatedAt(null);
    // A conversation reset never changes the server-backed lifetime allowance.
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || !token.current || busyRef.current || remaining === 0 || paused) return;
    busyRef.current = true; setBusy(true); setError(""); setInput("");
    const history = trimChatHistory(messages);
    setMessages((current) => [...current, { role: "user", content: message }]);
    const request = new AbortController();
    controller.current = request;
    const timeout = setTimeout(() => request.abort(), 55000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", credentials: "omit", cache: "no-store",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.current}` },
        body: JSON.stringify({ message, conversation_history: history }), signal: request.signal,
      });
      const data = await response.json();
      if (!mounted.current) return;
      if (response.status === 401) {
        token.current = null; setSignedIn(false);
      }
      if (data.code === "demo_limit_reached") setRemaining(0);
      if (data.code === "demo_daily_limit_reached" || data.code === "demo_auth_rate_limited") setPaused(true);
      if (data.code === "attempt_uncertain") setRemaining(null);
      if (!response.ok) throw new Error(data.error || "The request could not be completed.");
      if (typeof data.response !== "string" || !Number.isInteger(data.messages_remaining) || data.messages_remaining < 0 || data.messages_remaining > 2) {
        setRemaining(null);
        throw new Error("The service returned an incomplete answer. The attempt may still count.");
      }
      setRemaining(data.messages_remaining);
      setUpdatedAt(typeof data.data_updated_at === "string" && !Number.isNaN(Date.parse(data.data_updated_at)) ? data.data_updated_at : null);
      setMessages((current) => [...current, { role: "assistant", content: data.response }]);
    } catch (cause) {
      if (!mounted.current) return;
      if (request.signal.aborted || cause instanceof TypeError || cause instanceof SyntaxError) {
        setRemaining(null);
        setError("The connection ended before an answer arrived. This attempt may count toward your allowance. Nothing was retried automatically.");
      } else {
        setError(cause instanceof Error ? cause.message : "Unable to complete this request.");
      }
      setMessages((current) => current.slice(0, -1));
      setInput(message);
    } finally {
      clearTimeout(timeout);
      busyRef.current = false;
      if (mounted.current) { setBusy(false); inputRef.current?.focus(); }
    }
  }

  return (
    <section className="live-demo" id="live-demo" aria-labelledby="live-demo-title">
      <div className="demo-sign-in">
        <h3 id="live-demo-title">Ask your own question</h3>
        <p>Sign in with Google to search Sierra College courses live. Each account gets three questions in total, and a question can count even if the answer fails.</p>
        {!loadGoogle && <button className="button primary" onClick={() => setLoadGoogle(true)}>Load Google sign-in</button>}
        {loadGoogle && <Script src="https://accounts.google.com/gsi/client" onReady={initializeGoogle} onError={() => setError("Google sign-in could not load. Please reload the page to try again.")} />}
        <div ref={googleButton} hidden={!loadGoogle || signedIn} />
        {loadGoogle && !googleReady && !error && <p role="status">Loading Google sign-in…</p>}
        {signedIn && <button className="text-link" onClick={signOut} disabled={busy}>Sign out of this demo</button>}
        <p className="demo-privacy">Your sign-in and conversation are not saved in this browser. Questions go to the course service and its AI provider. The service counts usage per account without storing your name or email.</p>
      </div>
      <div className={signedIn || messages.length ? "replay chat-panel is-active" : "replay chat-panel"}>
        <div className="replay-bar">
          <span className="replay-avatar live-avatar" aria-hidden="true"><Mountain /></span>
          <span className="replay-name">Sierra Class Helper</span>
          <button className="reset-chat" onClick={resetConversation} disabled={busy || !messages.length} aria-label="Start a new conversation" title="Start a new conversation">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 9.5a5.5 5.5 0 1 0 1.7-4M4.5 3.5v3h3" /></svg>
          </button>
        </div>
        <div className="chat-transcript" role="log" aria-label="Chat conversation" aria-live="polite" ref={transcript}>
          {!messages.length && <p className="demo-empty">{signedIn ? "Ask about a subject, meeting time, campus, or course you have in mind." : "Sign in to ask your own question."}</p>}
          {messages.map((message, index) => (
            <div className={message.role === "user" ? "user-message" : "assistant-message"} key={index}>
              <div><span className={message.role === "user" ? "message-author sr-only" : "message-author"}>{message.role === "user" ? "You" : "Sierra Class Helper"}</span><ChatMessageContent role={message.role} content={message.content} /></div>
            </div>
          ))}
          {busy && <p className="chat-loading" role="status">Searching the course catalog…</p>}
        </div>
        <p className="demo-allowance" role="status" hidden={!signedIn && remaining === null}>{remaining === 0 ? "All three demo attempts have been used for this account." : remaining === null ? "Up to three lifetime attempts. Your remaining allowance is confirmed after a request." : `${remaining} demo ${remaining === 1 ? "attempt" : "attempts"} remaining.`}</p>
        {error && <p className="chat-error" role="alert">{error}</p>}
        {paused && <button className="text-link demo-resume" onClick={() => { setPaused(false); setError(""); }}>I’ll try again now</button>}
        <form className="chat-form" onSubmit={send}>
          <label className="sr-only" htmlFor="chat-input">Ask about courses</label>
          <input id="chat-input" ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000} disabled={!signedIn || busy || remaining === 0 || paused} placeholder={signedIn ? "Ask about a class…" : "Sign in to ask about a class"} aria-describedby="chat-disclosure" />
          <button aria-label="Send message" disabled={!signedIn || !input.trim() || busy || remaining === 0 || paused} type="submit">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4.5 15.5 10 10 15.5" /></svg>
          </button>
        </form>
        <p className="chat-disclosure" id="chat-disclosure">AI answers may be inaccurate. Confirm courses and enrollment details with <a href="https://www.sierracollege.edu/" target="_blank" rel="noreferrer">Sierra College</a>. {updatedAt && <>Course data updated: {new Date(updatedAt).toLocaleString()}.</>}</p>
      </div>
    </section>
  );
}
