"use client";

import { ChatContainer } from "@/components/ChatContainer";
import { AuthGuard } from "@/components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <ChatContainer />
    </AuthGuard>
  );
}
