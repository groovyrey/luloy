import { AblyProvider } from "ably/react";
import Ably from "ably";
import ChatClient from "./ChatClient";
import { UserProvider } from "../context/UserContext";

// IMPORTANT: Create a .env.local file in your project's root
// and add your new Ably API key like this:
// ABLY_API_KEY=your-new-key

const client = new Ably.Realtime({ authUrl: "/api/ably-token" });

export default function ChatPage() {
  return (
    <AblyProvider client={client}>
        <h1 className="text-center my-4">Public Chat Room</h1>
        <ChatClient />
    </AblyProvider>
  );
}

export const metadata = {
    title: "Chat",
    description: "Live chat room",
};
