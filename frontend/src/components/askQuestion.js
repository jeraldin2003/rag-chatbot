export default async function askQuestion(backendUrl, question, model) {
  const res = await fetch(`${backendUrl.replace(/\/$/, "")}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, model }),
  });

  if (!res.ok) {
    throw new Error(`Server responded with ${res.status}`);
  }
  const data = await res.json();
  // Accepts either { answer } or { response } or a raw string, in case the
  // backend's response key differs from what's shown here.
  return data.answer ?? data.response ?? data.result ?? JSON.stringify(data);
}
