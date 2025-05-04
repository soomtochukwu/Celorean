"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full ">
      <main className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">
        <form className="grid gap-4 md:gap-6" onSubmit={handleSubmit}>
          <Input
            id="question"
            // className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Type your question here..."
            onChange={handleInputChange}
          />
          <Button>Ask AI</Button>
        </form>
        <div className="p-4">
          <h3 className="font-semibold">AI Response:</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your AI response will appear here.
          </p>
        </div>
        {messages.map((m) => (
          <code
            key={m.id}
            className={
              m.role === "user"
                ? "bg-gray-300 text-right p-4 whitespace-pre-wrap"
                : "bg-gray-100 p-4 whitespace-pre-wrap"
            }
          >
            {/* {m.role === "user" ? "User: " : "AI: "} */}
            {m.content}
          </code>
        ))}
      </main>
    </div>
  );
}
