export async function checkDuplicateFileHash(hash) {
  const result = await client.scroll("hashes", {
    filter: {
      must: [
        {
          key: "file_hash",
          match: {
            value: hash,
          },
        },
      ],
    },
    limit: 1,
  });

  return result.points.length > 0;
}