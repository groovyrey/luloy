'use client';

import ChatClient from "./ChatClient";

export default function ChatPage() {
  return (
    <>
      <h1 className="text-center my-4">Public Chat Room</h1>
      <ChatClient />
    </>
  );
}