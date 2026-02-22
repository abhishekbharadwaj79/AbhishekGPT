import { ChatContainer } from "@/components/ChatContainer";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <ChatContainer />
    </div>
  );
}
