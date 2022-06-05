const { fetch } = require("node-fetch");
const apiKey = process.env.OPENAI_API_KEY;

async function postToAPI() {
  try {
    const url = "https://unknown-unknown.svc.unknown.pinecone.io/query";
    const headers = {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    };
    const body = {
      namespace: "example-namespace",
      topK: 10,
      includeValues: true,
      includeMetadata: true,
      vector: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
      id: "example-vector-1",
    };
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}