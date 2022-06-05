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
  { text: "mechanical engineering" },
  { text: "cooking" },
  { text: "automotive engineering" },
  { text: "electrician" },
];

let embeddedLabels = [];

const input = {
  text: "Sparky",
};

async function getEmbedding(label, { pushToArray }) {
  try {
    let time = Date.now();
    console.log("getting embedding for label: ", label.text);
    const response = await openai.createEmbedding("text-similarity-curie-001", {
      input: label.text,
    });
    const { data } = response.data;
    const embedding = data[0].embedding;
    if (pushToArray) {
      embeddedLabels.push({ text: label.text, embedding });
    }
    console.log(
      Date.now() - time,
      "ms to get embedding for label: ",
      label.text
    );
    return { text: label.text, embedding };
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

// check if labels are the same as in storedEmbeddings
function checkLabels() {
  const storedLabels = storedEmbeddings.map(({ text }) => text).sort();
  const inputLabels = labels.map(({ text }) => text).sort();
  const sameLabels = inputLabels.every((label, i) => label === storedLabels[i]);
  sameLabels
    ? console.log("\nusing stored labels")
    : console.log("\nembedding labels");
  return sameLabels;
}

// get embeddings for all labels with a Promise.all
async function getAllEmbeddings() {
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
      await getAllEmbeddings();
    }
    // find the label with the highest similarity
    const similarities = embeddedLabels.map(({ text, embedding }) => {
      const score = similarity(inputEmbedding.embedding, embedding);
      return { text, score };
    });
    const sorted = similarities.sort((a, b) => b.score - a.score);
    console.log(sorted);
    return sorted;
  } catch (error) {
    console.log(error.message);
  }
}
classifyInput();
