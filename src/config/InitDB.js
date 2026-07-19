import pool from "./db.js";

const initTable = async () => {
  const client = await pool.connect();
  try {
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");

    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        embedding VECTOR(768),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    
    await client.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_idx
ON documents USING hnsw (embedding vector_cosine_ops);
    `);

    console.log("✅ Tables initialized");
  } catch (err) {
    console.error("❌ Failed to initialize tables:", err);
    throw err; // don't swallow errors silently
  } finally {
    client.release();
  }
};

export default initTable;