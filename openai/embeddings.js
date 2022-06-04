const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const similarity = require("compute-cosine-similarity");
const { writeDoc } = require("../utils/writeDoc");
const storedEmbeddings = require("./embeddings.json");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let labels = [
  { text: "excited sentiment" },
  { text: "positive sentiment" },
  { text: "negative sentiment" },
  { text: "neutral sentiment" },
];

let embeddedLabels = [];

const input = {
  text: "I can't wait to get started!",
};

async function getEmbedding(label, { pushToArray }) {
  try {
    console.log("getting embedding for label: ", label.text);
    const response = await openai.createEmbedding("text-similarity-ada-001", {
      input: label.text,
    });
    const { data } = response.data;
    const embedding = data[0].embedding;
    if (pushToArray) {
      embeddedLabels.push({ text: label.text, embedding });
    }
    return { text: label.text, embedding };
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

// check if labels are the same as in storedEmbeddings
function checkLabels() {
  const storedLabels = storedEmbeddings.map(({ text }) => text);
  const inputLabels = labels.map(({ text }) => text);
  const sameLabels = storedLabels.every((label, i) => label === inputLabels[i]);
  return sameLabels;
}

// get embeddings for all labels with a Promise.all
async function getAllEmbeddingsPromiseAll() {
  try {
    const promises = labels.map((label) =>
      getEmbedding(label, { pushToArray: true })
    );
    await Promise.all(promises);
    writeDoc("./openai/embeddings.json", JSON.stringify(embeddedLabels));
  } catch (error) {
    console.log(error.message);
  }
}

async function classifyInput() {
  try {
    const inputEmbedding = await getEmbedding(input, { pushToArray: false });
    if (checkLabels()) {
      embeddedLabels = storedEmbeddings;
    } else {
      await getAllEmbeddingsPromiseAll();
    }
    // find the label with the highest similarity
    let highestSimilarity = 0;
    let highestSimilarityLabel = "";
    let difference;
    for (let i = 0; i < embeddedLabels.length; i++) {
      const similarityToLabel = similarity(
        embeddedLabels[i].embedding,
        inputEmbedding.embedding
      );

      console.log(
        "similarity to label: ",
        embeddedLabels[i].text,
        similarityToLabel
      );
      if (similarityToLabel > highestSimilarity) {
        // find the difference between the highest similarity and the second highest similarity
        difference = similarityToLabel - highestSimilarity;
        highestSimilarity = similarityToLabel;
        highestSimilarityLabel = embeddedLabels[i].text;
      }
    }
    console.log(
      "\n\nhighest similarity: ",
      highestSimilarityLabel,
      "\n\n with a difference of: ",
      difference
    );
  } catch (error) {
    console.log(error.message);
  }
}
classifyInput();
