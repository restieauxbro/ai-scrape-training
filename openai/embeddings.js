const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const similarity = require("compute-cosine-similarity");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let labels = [
  { text: "positive sentiment" },
  { text: "negative sentiment" },
  { text: "neutral sentiment" },
];

let embeddedLabels = [];

const input = {
  text: "I'm not totally sure how to feel, somethings I liked and others I wasn't sure of.",
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

// get embeddings for all labels
async function getAllEmbeddings() {
  try {
    for (let i = 0; i < labels.length; i++) {
      await getEmbedding(labels[i], { pushToArray: true });
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function classifyInput() {
  try {
    const inputEmbedding = await getEmbedding(input, { pushToArray: false });
    await getAllEmbeddings();
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
