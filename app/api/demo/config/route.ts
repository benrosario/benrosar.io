export const dynamic = "force-dynamic";
export function GET() {
  const clientId = process.env.SIERRA_GOOGLE_CLIENT_ID?.trim();
  const enabled = Boolean(process.env.SIERRA_API_URL && clientId && /^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId));
  return Response.json({ google_client_id: enabled ? clientId : null }, {
    headers: { "Cache-Control": "no-store" },
  });
}
