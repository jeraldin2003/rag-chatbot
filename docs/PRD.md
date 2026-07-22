# PRD: RAG Chatbot

## What we built
A chatbot that answers questions from a small set of uploaded PDFs (HR policy docs) instead of the model's general knowledge. Upload a PDF, ask a question, get an answer grounded in that document — or an honest "I don't know" if it's not covered.

## Who it's for
- The trainer, reviewing this against the Week 9/10 assignment rubric.
- An employee who wants a quick answer from a policy doc instead of reading the whole thing.

## Success looks like
- Relevant questions get accurate, grounded answers.
- Irrelevant questions get a clear "not enough information" instead of a made-up answer.
- Both Gemini and Ollama can answer the same question through their own route.
- Duplicate PDF uploads are caught and rejected.
- Multi-doc questions pull from more than one uploaded file when needed.

## Out of scope (for now)
- Multi-file upload, conversation memory, streaming responses, auth.
- Hybrid search / re-ranking, source citations in the answer text — planned for the Week 10 pass, not yet built.