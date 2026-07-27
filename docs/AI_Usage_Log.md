# AI Usage Log

AI tool used: Claude (Anthropic), via chat interface. Used throughout backend, frontend, and evaluation work on the RAG chatbot project.

## Backend — Database & Embedding Pipeline

| Prompt | Purpose | Outcome |
|---|---|---|
| Asked how to approach generating embeddings for a RAG pipeline on top of an existing Postgres/pgvector connection | Get a starting architecture for chunking, embedding, and storage | Used as the initial structure; embedding provider later changed |
| Asked whether an auto-initializing table setup function was the right pattern | Validate a DB init approach before committing to it | Confirmed and refined into an idempotent `CREATE TABLE IF NOT EXISTS` init function called from the server entrypoint |
| Asked for a test route to insert and retrieve dummy vector data | Sanity-check the pgvector integration end-to-end | Working test route, used to confirm inserts were succeeding |
| Debugged a `pgvector` registration error through several iterations | Fix incorrect import/registration of the pgvector type parser | Took two rounds to land on the correct fix (registering per-connection via `pool.on('connect')`) |
| Asked how to verify data was actually persisting in the DB | Confirm inserts weren't silently failing | Provided script/route/CLI options; turned out to be a false alarm, not a real bug |
| Asked for help building a PDF parser | Extract text from uploaded documents | Initial `pdf-parse`-based version had unresolved CJS/ESM import issues |
| Asked for an alternative parser with no import errors | Replace a broken dependency choice | Switched to `unpdf` (ESM-native), resolved cleanly |
| Asked to connect the parser output to Gemini embeddings | Wire up real embedding generation, replacing dummy vectors | Initial implementation used a since-deprecated model name |
| Asked to switch embedding calls to batches instead of one-by-one | Reduce API round-trips during ingestion | Implemented batched `embedTextBatch`, meaningfully faster ingestion |
| Reported a Gemini 404 on the embedding model | Diagnose and fix a breaking API change | Root-caused to a deprecated model; found and switched to `gemini-embedding-001` |
| Asked what happens on duplicate file uploads | Identify and close a gap in the ingestion flow | Discussed hash-based dedup design |
| Asked whether the PDF's parsed text should be hashed instead of the raw file | Improve the dedup strategy | Correct call — switched to hashing normalized extracted text, catching re-exported duplicates that byte-hashing would miss |

## Backend — Retrieval & Generation

| Prompt | Purpose | Outcome |
|---|---|---|
| Asked to build the retrieval system for matching user questions to stored embeddings | Core RAG retrieval step | Cosine-similarity retrieval route built and working |
| Flagged that an irrelevant query was still returning confident-looking results | Improve retrieval quality | Added a similarity threshold so low-relevance chunks are filtered out instead of always returning top-K |
| Asked to wire retrieval into an LLM call to complete the RAG loop | Full pipeline: retrieve → prompt → generate | Working `/chat` endpoint grounded in retrieved context |
| Asked to add a second, open-source model via Ollama | Meet the dual-provider requirement | Ollama integration added alongside Gemini |
| Requested separate routes per provider instead of a single toggle parameter | Architectural preference for independently testable endpoints | Refactored to `/chat/gemini` and `/chat/ollama` |
| Reported Ollama response times of ~10 minutes per request | Make the open-source model usable | Diagnosed as a model-size/hardware issue, not a code bug; recommended and switched to a smaller model (`qwen2.5:1.5b`) |

## Frontend

| Prompt | Purpose | Outcome |
|---|---|---|
| Asked for a phased build plan for a simple Next.js chat UI | Scope the frontend work before writing code | Seven-phase plan, built incrementally with a checkpoint after each phase |
| Requested the build use plain JavaScript, not TypeScript | Match team preference | Adjusted file structure and all subsequent code accordingly |
| Requested Tailwind for all styling with explicit top/bottom spacing | Styling requirement | Added Tailwind setup and updated component classes |
| Reported Tailwind config file was missing despite install | Debug an unexpected setup gap | Identified as expected Tailwind v4 behavior (CSS-based theme config, no JS config file) rather than a broken install |
| Progressed through each build phase (state wiring, real API calls, provider toggle, file upload) | Incremental frontend delivery | Each phase reviewed and confirmed working before moving to the next |

## Evaluation & Quality

| Prompt | Purpose | Outcome |
|---|---|---|
| Asked whether an initial set of eval questions was actually good | Sanity-check test quality before relying on it | Self-identified weaknesses (fabricated questions, weak scoring logic) and flagged the need for real document content |
| Provided actual uploaded policy documents and asked for grounded eval questions | Replace guessed test data with real reference answers | Rewrote all 10 Q&A pairs with answers verified against the source PDFs, including one genuine multi-document question |
| Ran the eval harness and shared results | Assess chatbot quality objectively rather than by inspection | Distinguished real defects (small model failing to decline irrelevant questions, a missed multi-doc retrieval) from false failures caused by overly strict keyword scoring |
| Asked what "smallest LLM" would work for Ollama | Balance speed vs. answer quality | Recommended against going smaller than the current model, since eval results already showed instruction-following degrading |

## Week 10 — Hybrid Search, Re-Ranking & Production Refinements

| Prompt | Purpose | Outcome |
|---|---|---|
| Asked to migrate vector store and implement BM25 Hybrid Search | Integrate lexical search alongside dense vector embeddings | Created in-memory Okapi BM25 engine (`bm25Service.js`) synced with Qdrant collection |
| Implement Reciprocal Rank Fusion (RRF) & candidate re-ranking | Fusion & candidate re-ordering | Implemented RRF ($k=60$) and second-stage phrase/coverage reranking pass in `retrievalService.js` |
| Enforce inline source citations and multi-turn conversation memory | Meet prompt & conversation requirements | Updated prompt templates for bracketed citations (e.g. `[POSH_POLICY.pdf]`) and added history context (last 3 turns) |
| Upgrade evaluation harness with latency and cost metrics | Automated model comparison | Extended `eval/runEval.js` to compute pass rate, average latency (ms), and estimated token costs ($) |
| Create ADR-004 model selection recommendation | Capstone deliverable | Generated 1-page decision record recommending Gemini API for production shipping |

## Summary
AI was used as a pair-programming and debugging partner across the full stack — architecture decisions (vector DB choice, provider routing, hybrid search, RRF fusion), implementation (embedding pipeline, retrieval, memory, frontend), and quality assurance (building and interpreting an evaluation harness against real documents). Errors and dead ends were part of the iteration process; several early fixes (pgvector registration, embedding model name, PDF parser choice) required more than one pass before landing on a working solution.