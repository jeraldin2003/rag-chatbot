import { Send, Settings2, Bot, User, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
export default function ChatHeader({ model, setModel, backendUrl, setBackendUrl, connected }) {
  const [showSettings, setShowSettings] = useState(false);
  const MODELS = [
    { id: "opensource", label: "Open source" },
    { id: "api", label: "API" },
  ];
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-[17px] leading-tight text-stone-900">Policy Desk</h1>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-stone-300"}`} />
              {connected ? "Connected" : "Not checked"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="text-sm border border-stone-200 rounded-md px-2.5 py-1.5 bg-stone-50 text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className="p-1.5 rounded-md border border-stone-200 text-stone-500 hover:bg-stone-50"
            aria-label="Backend settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="max-w-3xl mx-auto px-5 pb-4">
          <label className="block text-xs font-medium text-stone-500 mb-1">
            Backend URL
          </label>
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="http://localhost:8300"
            className="w-full text-sm border border-stone-200 rounded-md px-3 py-2 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
          <p className="text-xs text-stone-400 mt-1">
            Requests are sent to <code>{"{backendUrl}"}/chat</code>. Make sure CORS is enabled on the Express server.
          </p>
        </div>
      )}
    </header>
  );
}