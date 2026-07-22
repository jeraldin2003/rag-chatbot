import {client} from './Qdrant.js'
await client.createCollection("items", {
    vectors: { size: 384, distance: "Cosine" },
});
