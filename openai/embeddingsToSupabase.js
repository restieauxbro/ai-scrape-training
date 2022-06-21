const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const { upsertToDB } = require("../supabase.js");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const arr = [
  ...new Set([
     "engineer",
    "automotive",
    "vet",
    "nurse",
    "nursing",
    "health",
    "social services",
    "social worker",
    "education",
    "teacher",
    "teaching",
    "teach",
    "pre-k",
    "kindergarten",
    "elementary",
    "middle school",
    "high school",
    "college",
    "university",
    "math",
    "science",
    "english",
    "language arts",
    "history",
    "social studies",
    "art",
    "physical education",
    "music",
    "drama",
    "journalism",
    "media",
    "technology",
    "business",
    "finance",
    "entrepreneur",
    "entrepreneurship",
    "retail",
    "marketing",
    "advertising",
    "public relations",
    "computers",
    "computer science",
    "information technology",
    "software",
    "hardware",
    "programming",
    "software engineering",
    "computer engineering",
    "manufacturing",
    "plastics",
    "machining",
    "electrical engineering",
    "electronics",
    "computer engineering",
    "engineering",
    "mechanical engineering",
    "industrial engineering",
    "materials science and engineering",
    "materials engineering",
    "aerospace engineering",
    "civil engineering",
    "environmental engineering",
    "engineering management",
    "architecture",
    "landscape architecture",
    "environmental design",
    "interior design",
    "industrial design",
    "construction management",
    "theology",
    "religious studies",
    "philosophy",
    "political science",
    "economics",
    "psychology",
    "sociology",
  ]),
];

async function getAllEmbeddings(arr) {
  try {
    const embeddings = await Promise.all(
      arr.slice(0,1).map(async function (label) {
        const response = await openai.createEmbedding({
          model: "text-search-babbage-query-001",
          input: label,
        });
        const embeddingVals = response.data.data[0].embedding;
        return {
          term: label,
          embedding_babbage_query: embeddingVals,
          indexed_as: label,
          is_preferred: true
        };
      })
    );
    // console.log(embeddings);
    await upsertToDB("search_terms", embeddings, { onConflictColumn: "term" });
  } catch (error) {
    console.log(error.message);
  }
}

getAllEmbeddings(arr);
