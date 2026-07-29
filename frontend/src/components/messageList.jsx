import { useEffect, useRef } from "react";
import Message from "./messageBubble";
import EmptyState from "./emptyState";
import TypingIndicator from "./typingIndicator";
export default function MessageList({ messages, isLoading, onPickSuggestion }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return <EmptyState onPick={onPickSuggestion} />;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-5 py-6 flex flex-col gap-5">
        {messages.map((m) => (
          <Message key={m.id} role={m.role} content={m.content} isError={m.isError} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}