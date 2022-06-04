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

const input = { text: "This is so lame omg" };

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

// get embeddings for all labels and then console log the labels and embeddings
async function getAllEmbeddings() {
  try {
    for (let i = 0; i < labels.length; i++) {
      await getEmbedding(labels[i], { pushToArray: true });
    }
    // console.log(embeddedLabels);
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
    for (let i = 0; i < embeddedLabels.length; i++) {
      const similarityToLabel = similarity(
        embeddedLabels[i].embedding,
        inputEmbedding.embedding
      );
      console.log('similarity to label: ', embeddedLabels[i].text, similarityToLabel);
      if (similarityToLabel > highestSimilarity) {
        highestSimilarity = similarityToLabel;
        highestSimilarityLabel = embeddedLabels[i].text;
      }
    }
    console.log("highest similarity: ", highestSimilarityLabel);
  } catch (error) {
    console.log(error.message);
  }
}
classifyInput();
