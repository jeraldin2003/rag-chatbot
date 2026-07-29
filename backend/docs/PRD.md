# PRD: Production-Grade RAG Chatbot (v2)

## What we built
A production-grade Retrieval-Augmented Generation (RAG) chatbot that answers questions grounded strictly in uploaded policy PDFs. It features a hybrid retrieval pipeline (Dense Vector Search + BM25 Lexical Keyword Search) fused via Reciprocal Rank Fusion (RRF), a second-stage candidate reranker, multi-turn conversation memory, inline source citations, structured retrieval tracing, and an automated evaluation harness comparing API vs. Open-Source LLMs.

## Who it's for
- Program evaluator reviewing against Week 9 & 10 assignment rubric requirements.
- Employees seeking fast, verifiable, grounded answers from company policy manuals.

## Key Capabilities & Success Metrics
- **Hybrid Retrieval (BM25 + Vector Search)**: Combines Okapi BM25 keyword matching with Gemini embedding cosine similarity to capture both exact token matches (codes, numbers) and semantic intent.
- **Second-Stage Re-Ranking**: Re-scores top RRF candidates based on query term coverage and phrase alignment before context injection.
- **Multi-Turn Memory**: Retains the last 3 conversation turns (6 messages) to correctly resolve contextual follow-up questions.
- **Inline Source Citations**: Every claim in the generated response includes verifiable bracketed citations (e.g. `"[POSH_POLICY.pdf]"`).
- **Graceful Grounded Refusal**: Explicitly declines to answer (`"I don't have enough information in the uploaded documents to answer that."`) when context is low or query is irrelevant.
- **Automated Evaluation Harness**: Benchmarks accuracy (pass rate), average latency (ms), and per-query token cost ($) across API (Gemini) and Open-Source (Ollama) models.

## Architecture Scope
- Vector Database: Qdrant
- Embedding Engine: Gemini `text-embedding-004`
- Lexical Engine: Custom Okapi BM25 (`bm25Service.js`)
- LLM Providers: Gemini API (`gemini-1.5-flash`) & Ollama Open-Source (`qwen2.5:1.5b` / `phi3`)