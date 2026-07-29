import { useEffect, useRef } from "react";
import { Send, Loader2, Paperclip, X, FileText } from "lucide-react";
import { validatePdfFiles } from "@/lib/validatePdfFiles";
import { ACCEPTED_EXT, ACCEPTED_MIME } from "@/lib/uploadLimits";

export default function ChatInput({
  value,
  onChange,
  onSend,
  onAttachFiles,
  onValidationError,
  pendingFiles = [],
  onRemoveFile,
  disabled,
  isUploading,
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const { validFiles, errors } = validatePdfFiles(files, pendingFiles);

    if (errors.length && onValidationError) {
      onValidationError(errors.join("\n"));
    }

    if (validFiles.length && onAttachFiles) {
      onAttachFiles(validFiles);
    }

    e.target.value = "";
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [value]);

  const canSend = value.trim() || pendingFiles.length > 0;
  const inputDisabled = disabled || isUploading;

  return (
    <div className="border-t border-stone-200 bg-white">
      <div className="max-w-3xl mx-auto px-5 py-4">
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {pendingFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-1.5 text-xs bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700"
              >
                <FileText className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span className="truncate max-w-[180px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFile?.(file.name)}
                  disabled={inputDisabled}
                  className="text-stone-400 hover:text-stone-700 disabled:opacity-50"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 focus-within:ring-1 focus-within:ring-stone-400">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={`${ACCEPTED_EXT},${ACCEPTED_MIME}`}
            disabled={inputDisabled}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={inputDisabled}
            className="w-8 h-8 rounded-lg hover:bg-stone-200 disabled:opacity-50 text-stone-500 hover:text-stone-800 flex items-center justify-center shrink-0 transition-colors mb-[1px]"
            aria-label="Attach PDF files"
            title="Attach PDF files (max 10, 10 MB each)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about policy…"
            rows={1}
            disabled={inputDisabled}
            className="flex-1 resize-none bg-transparent text-[14.5px] text-stone-800 placeholder-stone-400 focus:outline-none py-1.5 max-h-[140px]"
          />

          <button
            onClick={onSend}
            disabled={inputDisabled || !canSend}
            className="w-8 h-8 rounded-lg bg-stone-900 disabled:bg-stone-200 flex items-center justify-center shrink-0 transition-colors"
            aria-label="Send message"
          >
            {inputDisabled ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-stone-400 mt-1.5 px-1">
          Enter to send, Shift + Enter for a new line. PDF only · Max 10 MB each ·
          Up to 10 files.
        </p>
      </div>
    </div>
  );
}
