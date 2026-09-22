import test from "node:test";
import assert from "node:assert/strict";
import { GET } from "../app/api/demo/config/route.ts";

test("demo stays disabled without both settings and exposes no private configuration", async () => {
  const before = { api: process.env.SIERRA_API_URL, client: process.env.SIERRA_GOOGLE_CLIENT_ID };
  try {
    for (const [api, client, expected] of [
      [undefined, undefined, null],
      ["https://api.example.test", undefined, null],
      [undefined, "public-client.apps.googleusercontent.com", null],
      ["https://api.example.test", "not-a-google-client", null],
      ["https://api.example.test", "public-client.apps.googleusercontent.com", "public-client.apps.googleusercontent.com"],
    ]) {
      if (api === undefined) delete process.env.SIERRA_API_URL;
      else process.env.SIERRA_API_URL = api;
      if (client === undefined) delete process.env.SIERRA_GOOGLE_CLIENT_ID;
      else process.env.SIERRA_GOOGLE_CLIENT_ID = client;
      const response = GET();
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.deepEqual(await response.json(), { google_client_id: expected });
    }
  } finally {
    if (before.api === undefined) delete process.env.SIERRA_API_URL;
    else process.env.SIERRA_API_URL = before.api;
    if (before.client === undefined) delete process.env.SIERRA_GOOGLE_CLIENT_ID;
    else process.env.SIERRA_GOOGLE_CLIENT_ID = before.client;
  }
});
