// eval/runEval.js
import { testQuestions } from "./testQuestions.js";

const BACKEND_URL = "http://localhost:3001";
const PROVIDER = process.env.EVAL_PROVIDER || "gemini"; // "gemini" | "ollama"

async function askQuestion(question) {
  const res = await fetch(`${BACKEND_URL}/chat/${PROVIDER}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  return { status: res.status, body: await res.json().catch(() => ({})) };
}

function scoreResult(testCase, result) {
  const { type, expectedKeywords } = testCase;

  // Empty query should fail validation, not return an answer
  if (type === "empty") {
    return result.status === 400 ? { pass: true, reason: "correctly rejected empty query" } : { pass: false, reason: `expected 400, got ${result.status}` };
  }

  if (result.status !== 200) {
    return { pass: false, reason: `unexpected status ${result.status}` };
  }

  const answer = (result.body.answer || "").toLowerCase();

  // Irrelevant questions should trigger the "not enough information" fallback
  if (type === "irrelevant") {
    const isFallback = answer.includes("don't have enough information") || answer.includes("do not have enough information");
    return isFallback
      ? { pass: true, reason: "correctly declined to answer" }
      : { pass: false, reason: "expected fallback response, got a confident answer" };
  }

  // Ambiguous questions: pass if it responds sensibly (no crash, non-empty) —
  // loosely scored since there's no single "correct" answer
  if (type === "ambiguous") {
    return answer.length > 0
      ? { pass: true, reason: "produced a non-empty response" }
      : { pass: false, reason: "empty answer" };
  }

  // relevant / specific-detail / multi-doc: check expected keywords appear
  const missing = expectedKeywords.filter((kw) => !answer.includes(kw.toLowerCase()));
  return missing.length === 0
    ? { pass: true, reason: "all expected keywords found" }
    : { pass: false, reason: `missing keywords: ${missing.join(", ")}` };
}

async function runEval() {
  console.log(`\nRunning evaluation harness against ${BACKEND_URL} (provider: ${PROVIDER})\n`);

  const results = [];

  for (const testCase of testQuestions) {
    const result = await askQuestion(testCase.question);
    const scored = scoreResult(testCase, result);

    results.push({
      id: testCase.id,
      type: testCase.type,
      question: testCase.question || "(empty)",
      answer: result.body.answer || "(none)",
      pass: scored.pass,
      reason: scored.reason,
    });

    console.log(
      `[${scored.pass ? "PASS" : "FAIL"}] #${testCase.id} (${testCase.type}) — ${scored.reason}`
    );
  }

  const passCount = results.filter((r) => r.pass).length;
  const scorePct = ((passCount / results.length) * 100).toFixed(1);

  console.log(`\n── Summary ──`);
  console.log(`${passCount}/${results.length} passed (${scorePct}%)\n`);

  console.table(
    results.map((r) => ({
      id: r.id,
      type: r.type,
      pass: r.pass ? "✓" : "✗",
      reason: r.reason,
    }))
  );

  return { passCount, total: results.length, scorePct, results };
}

runEval();