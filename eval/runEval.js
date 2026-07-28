import { testQuestions, emptyQueryTest } from "./testQuestions.js";
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 8000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const PROVIDER = process.env.EVAL_PROVIDER || "gemini"; // "gemini" | "ollama"

// Cost per 1k tokens: Gemini 1.5 Flash (Input: $0.000075/1k, Output: $0.0003/1k), Ollama ($0)
const GEMINI_INPUT_COST_PER_1K = 0.000075;
const GEMINI_OUTPUT_COST_PER_1K = 0.0003;

async function askQuestion(question) {
  const startTime = performance.now();
  const res = await fetch(`${BACKEND_URL}/chat/${PROVIDER}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const latency = Math.round(performance.now() - startTime);

  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, latency };
}

function scoreResult(testCase, result) {
  const { type, expectedKeywords } = testCase;

  if (type === "empty") {
    return result.status === 400
      ? { pass: true, reason: "correctly rejected empty query" }
      : { pass: false, reason: `expected 400, got ${result.status}` };
  }

  if (result.status !== 200) {
    return { pass: false, reason: `unexpected status ${result.status}` };
  }

  const answer = (result.body.answer || "").toLowerCase();

  if (type === "irrelevant") {
    const isFallback =
      answer.includes("don't have enough information") ||
      answer.includes("do not have enough information");
    return isFallback
      ? { pass: true, reason: "correctly declined to answer" }
      : { pass: false, reason: "expected fallback response, got a confident answer" };
  }

  if (type === "ambiguous") {
    return answer.length > 0
      ? { pass: true, reason: "produced a non-empty response" }
      : { pass: false, reason: "empty answer" };
  }

  const missing = expectedKeywords.filter(
    (kw) => !answer.includes(kw.toLowerCase())
  );
  return missing.length === 0
    ? { pass: true, reason: "all expected keywords found" }
    : { pass: false, reason: `missing keywords: ${missing.join(", ")}` };
}

function estimateCost(provider, answerText) {
  if (provider === "ollama") return 0;
  // Estimated ~1200 prompt tokens (context + query) and output word count * 1.3
  const inputTokens = 1200;
  const outputTokens = Math.ceil((answerText || "").split(/\s+/).length * 1.3);
  return (
    (inputTokens / 1000) * GEMINI_INPUT_COST_PER_1K +
    (outputTokens / 1000) * GEMINI_OUTPUT_COST_PER_1K
  );
}

async function runEval() {
  console.log(`\n======================================================`);
  console.log(`🚀 Evaluation Harness: ${PROVIDER.toUpperCase()}`);
  console.log(`URL: ${BACKEND_URL}/chat/${PROVIDER}`);
  console.log(`======================================================\n`);

  const allCases = [...testQuestions, emptyQueryTest];
  const results = [];
  let totalLatency = 0;
  let totalEstimatedCost = 0;

  for (const testCase of allCases) {
    const result = await askQuestion(testCase.question);
    const scored = scoreResult(testCase, result);
    const cost = estimateCost(PROVIDER, result.body.answer);

    totalLatency += result.latency;
    totalEstimatedCost += cost;

    results.push({
      id: testCase.id,
      type: testCase.type,
      question: testCase.question || "(empty)",
      answer: result.body.answer || "(none)",
      pass: scored.pass,
      reason: scored.reason,
      latencyMs: result.latency,
      estimatedCost: cost,
    });

    console.log(
      `[${scored.pass ? "PASS" : "FAIL"}] #${testCase.id} (${testCase.type}) — ${result.latency}ms — ${scored.reason}`
    );
  }

  const passCount = results.filter((r) => r.pass).length;
  const scorePct = ((passCount / results.length) * 100).toFixed(1);
  const avgLatency = Math.round(totalLatency / results.length);
  const avgCostPerQuery = (totalEstimatedCost / results.length).toFixed(6);

  console.log(`\n📊 ── MODEL EVALUATION REPORT (${PROVIDER.toUpperCase()}) ──`);
  console.log(`- Accuracy / Pass Rate: ${passCount}/${results.length} (${scorePct}%)`);
  console.log(`- Average Latency:     ${avgLatency} ms / query`);
  console.log(`- Estimated Cost:      $${avgCostPerQuery} / query ($${totalEstimatedCost.toFixed(6)} total)\n`);

  console.table(
    results.map((r) => ({
      id: r.id,
      type: r.type,
      pass: r.pass ? "✓" : "✗",
      latency: `${r.latencyMs}ms`,
      cost: `$${r.estimatedCost.toFixed(6)}`,
      reason: r.reason,
    }))
  );

  return { passCount, total: results.length, scorePct, avgLatency, avgCostPerQuery, results };
}

runEval();