import Ably from "ably";

export async function GET(request) {
  // IMPORTANT: Replace this with a new key from your Ably dashboard
  // and store it in a .env.local file.
  const ABLY_API_KEY = process.env.ABLY_API_KEY;

  if (!ABLY_API_KEY) {
    return new Response("Missing ABLY_API_KEY environment variable", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const client = new Ably.Realtime({
    key: ABLY_API_KEY,
  });

  // The client ID can be associated with the currently logged-in user
  const clientId = request.nextUrl.searchParams.get('clientId') || "anonymous";

  try {
    const tokenRequest = await client.auth.createTokenRequest({ clientId: clientId });
    return new Response(JSON.stringify(tokenRequest), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(`Error creating Ably token request: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
