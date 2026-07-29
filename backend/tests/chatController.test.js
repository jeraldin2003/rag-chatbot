import test from "node:test";
import assert from "node:assert/strict";
import { handleChat } from "../src/controllers/chatController.js";

test("handleChat validates empty question with 400 response", async () => {
  const handler = handleChat("gemini");
  const req = { body: { question: "" } };
  let statusCode = 0;
  let jsonResponse = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
  };

  await handler(req, res, () => {});

  assert.equal(statusCode, 400);
  assert.equal(jsonResponse.error, "Question is required");
});
