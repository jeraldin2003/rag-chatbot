"use client";
import { useState, useRef, useEffect } from "react";

import askQuestion from "@components/askQuestion";
import ChatInput from '@components/chatInput';
import ChatHeader from '@components/chatHeader';
import MessageList from '@components/messageList';


const DEFAULT_BACKEND_URL = "http://localhost:8300";


export default function ChatApp() {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [model, setModel] = useState("opensource");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const sendMessage = async (text) => {
    const question = (text ?? input).trim();
    if (!question || isLoading) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const answer = await askQuestion(backendUrl, question, model);
      setConnected(true);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: answer },
      ]);
    } catch (err) {
      setConnected(false);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          isError: true,
          content: `Couldn't reach the backend. ${err.message}. Check the backend URL in settings and confirm the Express server is running with CORS enabled.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white font-sans">
      <ChatHeader
        model={model}
        setModel={setModel}
        backendUrl={backendUrl}
        setBackendUrl={setBackendUrl}
        connected={connected}
      />
      <MessageList messages={messages} isLoading={isLoading} onPickSuggestion={sendMessage} />
      <ChatInput value={input} onChange={setInput} onSend={() => sendMessage()} disabled={isLoading} />
    </div>
  );
}