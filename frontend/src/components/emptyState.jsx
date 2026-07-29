import { Send, Settings2, Bot, User, AlertCircle, Loader2, Sparkles } from "lucide-react";
const SUGGESTIONS = [
  "Tell me about sick leave policy.",
  "How many vacation days do I get?",
  "What's the process for expense reimbursement?",
];
export default function EmptyState({ onPick }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center mb-4">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <h2 className="font-serif text-lg text-stone-900 mb-1">Ask about company policy</h2>
      <p className="text-sm text-stone-500 mb-6 max-w-xs">
        Answers are generated from your internal policy documents.
      </p>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-left text-sm border border-stone-200 rounded-lg px-3.5 py-2.5 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
