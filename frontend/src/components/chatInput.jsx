
import { useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
export default function ChatInput({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [value]);

  return (
    <div className="border-t border-stone-200 bg-white">
      <div className="max-w-3xl mx-auto px-5 py-4">
        <div className="flex items-end gap-2 border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 focus-within:ring-1 focus-within:ring-stone-400">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about policy…"
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent text-[14.5px] text-stone-800 placeholder-stone-400 focus:outline-none py-1.5 max-h-[140px]"
          />
          <button
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="w-8 h-8 rounded-lg bg-stone-900 disabled:bg-stone-200 flex items-center justify-center shrink-0 transition-colors"
            aria-label="Send message"
          >
            {disabled ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-stone-400 mt-1.5 px-1">
          Enter to send, Shift + Enter for a new line.
        </p>
      </div>
    </div>
  );
}