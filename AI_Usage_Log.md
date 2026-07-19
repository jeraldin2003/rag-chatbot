# AI Usage Log — RAG Chat App Backend (Claude-Assisted Development)

**Project:** Node.js/Express RAG-based chat app
**Session date:** July 17–19, 2026
**AI assistant used:** Claude (Anthropic)
**Stack:** Express, PostgreSQL + pgvector, Google Gemini API (embeddings + generation)

---

## Summary

This session covered building the backend of a Retrieval-Augmented Generation (RAG) chat application end-to-end, from database connectivity through to a working `/chat` endpoint that retrieves relevant document context and generates grounded answers via Gemini.

---

## Work Log

| # | Task | AI Contribution | Outcome |
|---|------|-----------------|---------|
| 1 | PostgreSQL + pgvector connection setup | Reviewed existing `pg` Pool setup; guided embedding pipeline architecture | Established `db.js` connection module |
| 2 | Auto-initialize DB tables | Wrote idempotent `CREATE TABLE IF NOT EXISTS` / `CREATE EXTENSION` init script pattern, advised against running at import-time | `InitDB.js` created |
| 3 | Test route for vector insert/retrieve | Wrote dummy-data insert + similarity self-check route | `/test-vector` route |
| 4 | Debug: `pgvector.registerTypes is not a function` | Diagnosed wrong import path (`pgvector` root vs `pgvector/pg`) | Fixed import, corrected to `pool.on('connect', ...)` pattern |
| 5 | Debug: `ECONNREFUSED` on DB connection | Diagnosed as Postgres unreachable (not a code bug); walked through `.env`/host/port checklist | Root cause: Postgres not running/misconfigured host |
| 6 | Debug: `.env` not loading | Explained working-directory dependency of `dotenv.config()` and path resolution | Confirmed env vars loading correctly (Aiven Postgres) |
| 7 | Debug: `client.setTypeParser is not a function` | Diagnosed Pool vs Client API mismatch; corrected to per-connection type registration | Working `db.js` |
| 8 | DB inspection guidance | Provided script, route, `psql`, and GUI-tool options for verifying stored data | `checkDb.js` / `/documents` route |
| 9 | Debug: insert route "not storing anything" | Diagnosed as a false alarm — data was inserting correctly; walked through verification steps | Confirmed working via response inspection |
| 10 | PDF parsing | Built PDF upload + text extraction flow using `pdf-parse`, then `multer` upload handling | Initial `pdfParser.js` + `/upload-pdf` route |
| 11 | Debug: `pdf-parse` ESM/CJS export error | Diagnosed CommonJS/ESM interop issue; attempted `pkg.default \|\| pkg` workaround, then `createRequire` workaround | Partial fixes; ultimately replaced library |
| 12 | Debug: Multer `Field name missing` | Diagnosed as client-side form-data field naming issue (`file` field required) | Explained correct Postman/fetch/curl usage |
| 13 | Switched PDF parser library | Recommended and implemented `unpdf` (ESM-native) to eliminate recurring interop errors | Stable `pdf_parser.js` |
| 14 | Debug: `res.send is not a function` / `res.status is not a function` | Diagnosed function signature mismatch — a `(req, res)` Express handler was being called as a plain service function | Refactored into separate service (`embeddingService.js`) vs. controller (`storeEmbedding.js`) layers; added missing `return` statements on early responses |
| 15 | Gemini embeddings integration | Wrote `embedText` using `@google/generative-ai` SDK; wired into `embedAndStore` | Initial single-item embedding flow |
| 16 | Batch embedding optimization | Rewrote to use `batchEmbedContents` with batching (50/request) to reduce API round-trips | Updated `embeddingService.js` |
| 17 | Debug: `syntax error at or near "USING"` (SQL) | Diagnosed missing index name / potential `hnsw` version incompatibility in `CREATE INDEX` statement | Corrected index syntax guidance |
| 18 | Debug: Gemini `404` on `text-embedding-004` | **Web search performed** — confirmed model deprecated; identified replacement `gemini-embedding-001` and its dimensionality behavior (3072 default, truncatable via `outputDimensionality`) | Updated `geminiEmbed.js`, aligned schema to `VECTOR(768)` |
| 19 | Duplicate file handling — design discussion | Proposed hash-based dedup (file-level table design) | Discussed, not initially adopted |
| 20 | Duplicate file handling — adapted to existing schema | Adjusted design to user's already-applied `file_hash` column on `documents` (no separate `files` table) | `hashFile.js` + dedup check in `upload.js` |
| 21 | Refined dedup approach | Identified that hashing raw PDF bytes misses re-exported/re-saved duplicates; recommended hashing extracted+normalized text instead | Adopted by user |
| 22 | Retrieval system | Built `retrievalService.js` using cosine distance (`<=>`) query against `documents` | `/retrieve` route |
| 23 | Debug: irrelevant results returned for unrelated query | Diagnosed as expected behavior (top-K always returns *something*); added similarity threshold filtering and calibration guidance | Updated `retrievalService.js` with `SIMILARITY_THRESHOLD` |
| 24 | Full RAG pipeline (retrieval + generation) | Wrote `geminiGenerate.js` (prompt construction, grounding instructions) and `ragService.js` tying retrieval + generation together | `/chat` endpoint, end-to-end RAG flow working |

---

## Key Technical Decisions Made

- **Embedding model:** `gemini-embedding-001` (replaced deprecated `text-embedding-004`), truncated to 768 dimensions via `outputDimensionality` to match `pgvector` schema.
- **Vector index:** `hnsw` via pgvector (version-dependent; `ivfflat` noted as fallback for older pgvector installs).
- **Architecture pattern enforced:** strict separation between Express route handlers (`req`/`res`) and plain service functions (data in, data out) — this was the root cause of multiple bugs during the session.
- **Deduplication:** SHA-256 hash of normalized extracted PDF text (not raw file bytes), stored per-chunk in `documents.file_hash`.
- **Relevance filtering:** cosine similarity threshold applied at the SQL level to avoid returning irrelevant chunks when no good match exists.
- **RAG grounding:** generation prompt explicitly instructs the model to decline answering when context is insufficient, reducing hallucination risk.

## Known Open Items / Suggested Follow-ups

- No conversation/chat history (multi-turn memory) yet — each `/chat` call is stateless.
- No retry logic on batch embedding failures (a failed batch currently loses that batch's work).
- No metadata-scoped retrieval (e.g. "search only within file X") implemented yet.
- Prompt-injection risk from untrusted PDF content acknowledged but not mitigated.
- Model name (`gemini-2.5-flash`) used for generation was not independently web-verified in this session — recommended to confirm against current Gemini API docs before production use.

---
