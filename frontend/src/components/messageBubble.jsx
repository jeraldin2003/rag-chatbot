import { Bot, User, AlertCircle } from "lucide-react";
export default function Message({ role, content, isError }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isUser ? "bg-stone-900" : isError ? "bg-red-100" : "bg-stone-100"
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : isError ? (
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-stone-600" />
        )}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-stone-900 text-white rounded-tr-sm"
            : isError
            ? "bg-red-50 text-red-700 border border-red-100 rounded-tl-sm"
            : "bg-stone-100 text-stone-800 rounded-tl-sm"
        }`}
      >
        {content}
      </div>
    </div>
  );
}