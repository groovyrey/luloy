'use client';

import { AblyProvider } from "ably/react";
import Ably from "ably";
import ChatClient from "./ChatClient";
import { useMemo } from "react";

// IMPORTANT: Create a .env.local file in your project's root
// and add your new Ably API key like this:
// ABLY_API_KEY=your-new-key

export default function ChatPage() {
  const client = useMemo(() => new Ably.Realtime({ authUrl: "/api/ably-token" }), []);

  return (
    <AblyProvider client={client}>
        <h1 className="text-center my-4">Public Chat Room</h1>
        <ChatClient />
    </AblyProvider>
  );
}
