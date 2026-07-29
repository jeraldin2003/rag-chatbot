# RAG Chatbot

A full-stack **Retrieval-Augmented Generation (RAG)** chatbot that lets you upload PDF documents and ask questions about their contents. The app ingests documents, stores semantic embeddings in a vector database, and uses hybrid search to retrieve relevant passages before generating grounded answers with a large language model.

## How It Works

1. **Upload** — PDF files are parsed, chunked, and embedded on the backend.
2. **Index** — Chunks and embeddings are stored in [Qdrant](https://qdrant.tech/), with BM25 keyword search kept in sync for hybrid retrieval.
3. **Ask** — When you send a question, the backend retrieves the most relevant chunks and passes them to an LLM to produce an answer grounded in your documents.

```text
┌─────────────┐     upload / chat      ┌─────────────┐     embeddings     ┌─────────┐
│   Frontend  │ ─────────────────────► │   Backend   │ ────────────────► │ Qdrant  │
│  (Next.js)  │ ◄───────────────────── │  (Express)  │ ◄──────────────── │         │
└─────────────┘                        └─────────────┘                    └─────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │ Ollama /    │
                                       │ Gemini LLM  │
                                       └─────────────┘
```

## Project Structure

```text
rag-express/
├── backend/          # Express API — upload, embedding, retrieval, chat
├── frontend/         # Next.js UI — chat interface and PDF upload
└── README.md         # This file
```

## Prerequisites

Before running the project locally, make sure you have:

| Requirement | Purpose |
|-------------|---------|
| [Node.js](https://nodejs.org/) (v18+) | Run the frontend and backend |
| [Qdrant](https://qdrant.tech/) | Vector database for document embeddings (cloud instance or self-hosted) |
| [Ollama](https://ollama.com/) | Local LLM and embedding models (default setup) |
| Gemini API key *(optional)* | Only needed if you switch the backend to use Google Gemini instead of Ollama |

### Ollama models (default setup)

Pull the models the backend expects:

```bash
ollama pull nomic-embed-text   # embeddings (768 dimensions)
ollama pull qwen2.5:1.5b       # answer generation
```

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd rag-express
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file from the example and fill in your values:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: `8000`) |
| `QDRANT_DB_ENDPOINT` | Qdrant cluster URL |
| `QDRANT_DB_API` | Qdrant API key |
| `OLLAMA_EMBED_MODEL` | Embedding model name (default: `nomic-embed-text`) |
| `EMBEDDING_DIM` | Vector dimension — must match your embedding model (default: `768`) |
| `GEMINI_API_KEY` | Google Gemini API key (only if using Gemini) |

Initialize the Qdrant collections:

```bash
npm run db
```

Start the backend dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:8000`.

### 3. Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Optionally create a `frontend/.env` file if your backend runs on a non-default URL:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Start the frontend dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to the chatbot page.

## Using the App

1. **Upload documents** — Attach one or more PDF files (up to 10 files, 10 MB each) using the file picker in the chat input. Files are sent to the backend, chunked, and indexed automatically.
2. **Ask questions** — Type a question in the chat input and press Enter. The app retrieves relevant passages from your uploaded documents and generates an answer.
3. **Review responses** — Answers are grounded in the uploaded PDFs. If the information is not in your documents, the assistant will say it does not have enough context.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload_file/upload` | Upload PDF files for indexing |
| `POST` | `/chat/ollama` | Ask a question using the Ollama LLM |
| `POST` | `/chat/gemini` | Ask a question using Google Gemini |

## Development Scripts

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the API with nodemon |
| `npm run db` | Create Qdrant collections and indexes |
| `npm test` | Run backend tests |
| `npm run eval` | Run RAG evaluation suite |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |

## Troubleshooting

- **Qdrant dimension mismatch** — If you change embedding models, run `node src/scripts/dbCleaner.js` in the backend, then re-run `npm run db` and re-upload your documents.
- **CORS errors** — The backend allows requests from `http://localhost:3000` by default. If you run the frontend on a different port, update the `origin` in `backend/src/server.js`.
- **Ollama connection errors** — Make sure Ollama is running (`ollama serve`) and the required models are pulled.
- **Empty answers** — Upload at least one PDF before asking questions, and make sure Qdrant is reachable with valid credentials in `.env`.
