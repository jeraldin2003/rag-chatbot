"use client";
import { useState } from "react";

import askQuestion from "@components/askQuestion";
import uploadFiles from "@components/uploadFiles";
import ChatInput from "@components/chatInput";
import MessageList from "@components/messageList";
import { MAX_FILES } from "@/lib/uploadLimits";

const DEFAULT_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

function formatUploadStatus(data) {
  const lines = [`Uploaded ${data.successful} of ${data.totalFiles} file${data.totalFiles === 1 ? "" : "s"}.`, ""];

  for (const result of data.results) {
    if (result.success) {
      lines.push(
        `✓ ${result.filename} — ${result.pages} page${result.pages === 1 ? "" : "s"}, ${result.chunksCreated} chunk${result.chunksCreated === 1 ? "" : "s"}`
      );
    } else {
      lines.push(`✗ ${result.filename} — ${result.error}`);
    }
  }

  return lines.join("\n");
}

export default function ChatApp() {
  const [backendUrl] = useState(DEFAULT_BACKEND_URL);
  const [model] = useState("opensource");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleAttachFiles = (files) => {
    setValidationError("");
    setPendingFiles((prev) => {
      const merged = [...prev, ...files];
      return merged.slice(0, MAX_FILES);
    });
  };

  const handleRemoveFile = (filename) => {
    setPendingFiles((prev) => prev.filter((f) => f.name !== filename));
    setValidationError("");
  };

  const handleValidationError = (message) => {
    setValidationError(message);
  };

  const sendMessage = async (text) => {
    const question = (text ?? input).trim();
    const filesToUpload = [...pendingFiles];

    if ((!question && filesToUpload.length === 0) || isLoading || isUploading) {
      return;
    }

    if (question) {
      const userMsg = { id: crypto.randomUUID(), role: "user", content: question };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
    }

    let uploadFailed = false;

    if (filesToUpload.length > 0) {
      setIsUploading(true);

      try {
        const data = await uploadFiles(backendUrl, filesToUpload);
        setPendingFiles([]);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: formatUploadStatus(data),
            isError: data.successful === 0,
          },
        ]);
        if (data.successful === 0) uploadFailed = true;
      } catch (err) {
        uploadFailed = true;
        setPendingFiles(filesToUpload);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            isError: true,
            content: `Couldn't upload files. ${err.message}. Check that the backend is running.`,
          },
        ]);
      } finally {
        setIsUploading(false);
      }
    }

    if (!question || uploadFailed) return;

    setIsLoading(true);

    try {
      const answer = await askQuestion(backendUrl, question, model);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          isError: true,
          content: `Couldn't reach the backend. ${err.message}. Check the backend URL and confirm the Express server is running with CORS enabled.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white font-sans">
      <MessageList messages={messages} isLoading={isLoading} onPickSuggestion={sendMessage} />
      {validationError && (
        <div className="max-w-3xl mx-auto w-full px-5 pb-2">
          <p className="text-xs text-red-600 whitespace-pre-wrap">{validationError}</p>
        </div>
      )}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => sendMessage()}
        onAttachFiles={handleAttachFiles}
        onValidationError={handleValidationError}
        pendingFiles={pendingFiles}
        onRemoveFile={handleRemoveFile}
        disabled={isLoading}
        isUploading={isUploading}
      />
    </div>
  );
}
