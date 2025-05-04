import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import Chat from "./_components/chat";

export default function ChatPage() {
  return (
    <div className="w-full">
      <div className="lg:w-2/3">
        <Chat />
      </div>
    </div>
  );
}
