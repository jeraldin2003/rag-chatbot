import { client } from "../config/qdrant.js";

const COLLECTION = "items";

class BM25Index {
  constructor(k1 = 1.5, b = 0.75) {
    this.k1 = k1;
    this.b = b;
    this.documents = new Map(); // id -> { id, content, metadata, created_at, tokensCount, termFreqs }
    this.df = new Map(); // token -> count of docs containing token
    this.totalWords = 0;
    this.avgdl = 0;
    this.isInitialized = false;
  }

  tokenize(text) {
    if (!text) return [];
    return text.toLowerCase().match(/\w+/g) || [];
  }

  addDocument(doc) {
    if (this.documents.has(doc.id)) return;

    const tokens = this.tokenize(doc.content);
    const termFreqs = new Map();

    for (const token of tokens) {
      termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
    }

    for (const token of termFreqs.keys()) {
      this.df.set(token, (this.df.get(token) || 0) + 1);
    }

    this.documents.set(doc.id, {
      id: doc.id,
      content: doc.content,
      metadata: doc.metadata,
      created_at: doc.created_at,
      tokensCount: tokens.length,
      termFreqs,
    });

    this.totalWords += tokens.length;
    this.avgdl = this.totalWords / this.documents.size;
  }

  addDocuments(docs) {
    for (const doc of docs) {
      this.addDocument(doc);
    }
  }

  async syncFromQdrant() {
    try {
      let offset = null;
      let allPoints = [];

      do {
        const response = await client.scroll(COLLECTION, {
          limit: 200,
          offset,
          with_payload: true,
        });

        const points = response.points || [];
        allPoints.push(...points);
        offset = response.next_page_offset;
      } while (offset);

      this.clear();
      for (const point of allPoints) {
        if (point.payload?.content) {
          this.addDocument({
            id: point.id,
            content: point.payload.content,
            metadata: point.payload.metadata,
            created_at: point.payload.created_at,
          });
        }
      }

      this.isInitialized = true;
      console.log(`✅ BM25 index initialized with ${this.documents.size} documents`);
    } catch (err) {
      console.warn("⚠️ Failed to sync BM25 index from Qdrant:", err.message);
      this.isInitialized = true;
    }
  }

  search(query, topK = 10) {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0 || this.documents.size === 0) return [];

    const N = this.documents.size;
    const scores = [];

    for (const doc of this.documents.values()) {
      let score = 0;
      const docLen = doc.tokensCount;

      for (const token of queryTokens) {
        const tf = doc.termFreqs.get(token) || 0;
        if (tf === 0) continue;

        const df = this.df.get(token) || 0;
        const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
        const numerator = tf * (this.k1 + 1);
        const denominator =
          tf + this.k1 * (1 - this.b + this.b * (docLen / (this.avgdl || 1)));

        score += idf * (numerator / denominator);
      }

      if (score > 0) {
        scores.push({
          id: doc.id,
          content: doc.content,
          metadata: doc.metadata,
          created_at: doc.created_at,
          score,
        });
      }
    }

    return scores.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  clear() {
    this.documents.clear();
    this.df.clear();
    this.totalWords = 0;
    this.avgdl = 0;
    this.isInitialized = false;
  }
}

export const bm25 = new BM25Index();
