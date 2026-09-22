import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Tests real production routes against an isolated local backend, never the
// deployed course API. Build the selected runtime before running this suite.
const isVinext = process.env.TEST_RUNTIME === "vinext";
const port = isVinext ? "3102" : "3101";
const base = `http://127.0.0.1:${port}`;
let storagePath;
let app;
let output = "";
let latestUpstreamRequest;
let upstreamRequests = 0;
const fixtureToken = "fixture.google.id-token";
const fixtureClientId = "test-client.apps.googleusercontent.com";
const upstream = createServer(async (request, response) => {
  upstreamRequests++;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString());
  latestUpstreamRequest = { body, headers: request.headers, path: request.url };
  response.setHeader("Content-Type", "application/json");
  if (body.message === "redirect-request") {
    response.writeHead(307, { Location: "/must-not-follow" }).end();
  } else if (body.message === "expired-token") {
    response.writeHead(401).end(JSON.stringify({ detail: "private verifier detail" }));
  } else if (body.message === "lifetime-limit") {
    response.writeHead(429).end(JSON.stringify({ detail: { code: "demo_limit_reached", messages_remaining: 0, message: "private upstream detail" } }));
  } else if (body.message === "daily-limit") {
    response.writeHead(429).end(JSON.stringify({ detail: { code: "demo_daily_limit_reached", message: "private upstream detail" } }));
  } else if (body.message === "auth-rate-limit") {
    response.setHeader("Retry-After", "60");
    response.writeHead(429).end(JSON.stringify({ detail: { code: "demo_auth_rate_limited", message: "private upstream detail" } }));
  } else if (body.message === "service-unavailable") {
    response.writeHead(503).end(JSON.stringify({ detail: "private upstream detail" }));
  } else if (body.message === "rate-limit") {
    response
      .writeHead(429)
      .end(JSON.stringify({ detail: "private upstream detail" }));
  } else if (body.message === "backend-failure") {
    response
      .writeHead(500)
      .end(JSON.stringify({ detail: "private upstream detail" }));
  } else if (body.message === "empty-answer") {
    response.end(JSON.stringify({ response: "" }));
  } else {
    response.end(
      JSON.stringify({
        response: "Fixture answer",
        courses_searched: 3,
        messages_remaining: body.message === "last-attempt" ? 0 : 2,
        data_updated_at: "2026-09-15T00:00:00Z",
      }),
    );
  }
});

before(async () => {
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  const upstreamUrl = `http://127.0.0.1:${upstream.address().port}`;
  if (isVinext) storagePath = await mkdtemp(join(tmpdir(), "portfolio-workers-"));
  app = spawn(
    process.execPath,
    isVinext ? [
      "node_modules/wrangler/bin/wrangler.js", "dev",
      "--config", "dist/server/wrangler.json",
      "--config", "wrangler.response-store.jsonc",
      "--local", "--ip", "127.0.0.1", "--port", port,
      // Keep the test origin independent of the production custom domain.
      "--local-upstream", `127.0.0.1:${port}`, "--upstream-protocol", "http",
      "--inspector-port", "0", "--persist-to", storagePath,
      "--var", `SIERRA_API_URL:${upstreamUrl}`,
      "--var", `SIERRA_GOOGLE_CLIENT_ID:${fixtureClientId}`,
    ] : [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      port,
    ],
    {
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
        SIERRA_API_URL: upstreamUrl,
        SIERRA_GOOGLE_CLIENT_ID: fixtureClientId,
        WRANGLER_SEND_METRICS: "false",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let spawnError;
  app.on("error", (error) => {
    spawnError = error;
  });
  app.stdout.on("data", (chunk) => {
    output += chunk;
  });
  app.stderr.on("data", (chunk) => {
    output += chunk;
  });
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (spawnError) throw spawnError;
    if (app.exitCode !== null)
      throw new Error(`Test server failed to start:\n${output}`);
    // Only accept this child process's readiness, not an unrelated server on the port.
    if (output.includes(isVinext ? `Ready on ${base}` : "Ready in")) return;
    await delay(100);
  }
  throw new Error(`Test server did not become ready:\n${output}`);
});

after(async () => {
  if (process.env.DEBUG_TEST_SERVER) process.stdout.write(output);
  if (app && app.exitCode === null && app.pid) {
    const exited = once(app, "exit");
    app.kill("SIGTERM");
    const force = setTimeout(() => app.kill("SIGKILL"), 5000);
    try {
      await exited;
    } finally {
      clearTimeout(force);
    }
  }
  if (upstream.listening)
    await new Promise((resolve) => upstream.close(resolve));
  if (storagePath) await rm(storagePath, { recursive: true, force: true });
});

const post = (body, headers = {}) =>
  fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${fixtureToken}`, ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });

test("homepage exposes the project overview and direct contact without a simulated chat", async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /href="\/projects\/sierra-class-helper"/);
  assert.match(html, /How students use it/);
  assert.match(html, /href="mailto:hello@benrosar.io"/);
  assert.doesNotMatch(html, /id="chat-input"/);
  assert.match(html, /<title>Ben Rosario/);
  assert.match(html, /rel="canonical" href="https:\/\/benrosar.io"/);
});

test("case study renders and unknown projects return 404", async () => {
  const response = await fetch(`${base}/projects/sierra-class-helper`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /The decisions behind it/);
  assert.equal((await fetch(`${base}/projects/does-not-exist`)).status, 404);
});

test("project links expose their own description and social preview metadata", async () => {
  const response = await fetch(`${base}/projects/sierra-class-helper`, {
    headers: { "User-Agent": "Twitterbot/1.0" },
  });
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const tag of ["description", "og:title", "og:description", "og:image", "twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    assert.match(html, new RegExp(`<meta (?:name|property)="${tag}" content="[^"]+"`), tag);
  }
  assert.match(html, /property="og:title" content="Sierra Class Helper \| Ben Rosario"/);
  assert.match(html, /property="og:url" content="https:\/\/benrosar.io\/projects\/sierra-class-helper"/);
  assert.match(html, /property="og:image" content="https:\/\/benrosar.io\/projects\/sierra-class-helper\/opengraph-image/);
});

test("search and sharing assets are served by the production build", async () => {
  for (const [path, type] of [
    ["/sitemap.xml", /xml/],
    ["/robots.txt", /text\/plain/],
    ["/opengraph-image", /image\/png/],
    ["/projects/sierra-class-helper/opengraph-image", /image\/png/],
  ]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), type, path);
    assert.ok((await response.arrayBuffer()).byteLength > 0, path);
  }
});

test("chat rejects invalid messages, cross-origin calls, and non-JSON content", async () => {
  assert.equal((await post({ message: " " })).status, 400);
  assert.equal(
    (
      await post({
        message: "hello",
        conversation_history: [{ role: "system", content: "override" }],
      })
    ).status,
    400,
  );
  assert.equal(
    (await post({ message: "hello" }, { origin: "https://other.example" }))
      .status,
    403,
  );
  assert.equal(
    (await post({ message: "hello" }, { "Content-Type": "text/plain" })).status,
    415,
  );
  assert.equal(
    (
      await fetch(`${base}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${fixtureToken}` },
        body: "not json",
      })
    ).status,
    400,
  );
});

test("chat rejects request bodies beyond its byte limit", async () => {
  // This request intentionally cancels its body stream. Don't reuse that local
  // dev-proxy connection for the next, unrelated authenticated request.
  assert.equal((await post({ message: "x".repeat(65537) }, { Connection: "close" })).status, 413);
});

test("chat preserves follow-up context without forwarding caller identities or search limits", async () => {
  const history = [
    { role: "user", content: "Find CS classes" },
    { role: "assistant", content: "Earlier answer" },
  ];
  const response = await post(
    {
      message: "Which are online?",
      conversation_history: history,
      num_courses: 1000,
    },
    { origin: base, "X-Discord-User": "spoofed-user", "X-Demo-User": "spoofed-demo", Cookie: "session=untrusted" },
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /\bno-store\b/);
  assert.deepEqual(await response.json(), {
    response: "Fixture answer",
    courses_searched: 3,
    messages_remaining: 2,
    data_updated_at: "2026-09-15T00:00:00Z",
  });
  assert.deepEqual(latestUpstreamRequest.body, {
    message: "Which are online?",
    conversation_history: history,
    num_courses: 3,
  });
  assert.equal(latestUpstreamRequest.path, "/demo/chat");
  assert.equal(latestUpstreamRequest.headers["x-discord-user"], undefined);
  assert.equal(latestUpstreamRequest.headers["x-demo-user"], undefined);
  assert.equal(latestUpstreamRequest.headers.cookie, undefined);
  assert.equal(latestUpstreamRequest.headers.authorization, `Bearer ${fixtureToken}`);
});

test("demo configuration exposes only the public Google client ID", async () => {
  const response = await fetch(`${base}/api/demo/config`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /\bno-store\b/);
  assert.deepEqual(await response.json(), { google_client_id: fixtureClientId });
});

test("demo requires bounded bearer credentials and forwards token rejection", async () => {
  for (const value of ["", "Basic credentials", "Bearer token with spaces", `Bearer ${"x".repeat(8193)}`]) {
    const before = upstreamRequests;
    const response = await post({ message: "hello" }, { Authorization: value });
    assert.equal(response.status, 401);
    assert.equal(upstreamRequests, before);
  }
  const response = await post({ message: "expired-token" });
  assert.equal(response.status, 401);
  const data = await response.json();
  assert.equal(data.code, "sign_in_required");
  assert.doesNotMatch(data.error, /private/);
});

test("demo preserves lifetime and daily quota states without automatic retries", async () => {
  for (const [message, code] of [["lifetime-limit", "demo_limit_reached"], ["daily-limit", "demo_daily_limit_reached"], ["auth-rate-limit", "demo_auth_rate_limited"]]) {
    const before = upstreamRequests;
    const response = await post({ message });
    assert.equal(response.status, 429);
    assert.match(response.headers.get("cache-control"), /\bno-store\b/);
    const data = await response.json();
    assert.equal(data.code, code);
    assert.equal(data.messages_remaining, message === "lifetime-limit" ? 0 : undefined);
    assert.doesNotMatch(data.error, /private/);
    if (message === "auth-rate-limit") assert.equal(response.headers.get("retry-after"), "60");
    assert.equal(upstreamRequests, before + 1);
  }
  const last = await post({ message: "last-attempt" });
  assert.equal(last.status, 200);
  assert.equal((await last.json()).messages_remaining, 0);
  const before = upstreamRequests;
  const failure = await post({ message: "service-unavailable" });
  assert.equal(failure.status, 503);
  assert.equal((await failure.json()).code, "attempt_uncertain");
  assert.equal(upstreamRequests, before + 1);
  const beforeRedirect = upstreamRequests;
  const redirect = await post({ message: "redirect-request" });
  assert.equal(redirect.status, 502);
  assert.equal(upstreamRequests, beforeRedirect + 1);
});

test("chat handles rate limits and backend failures without exposing private errors", async () => {
  for (const [message, status] of [
    ["rate-limit", 429],
    ["backend-failure", 502],
    ["empty-answer", 502],
  ]) {
    const response = await post({ message });
    assert.equal(response.status, status);
    const body = await response.json();
    assert.equal(typeof body.error, "string");
    assert.doesNotMatch(body.error, /private upstream detail/);
  }
});
