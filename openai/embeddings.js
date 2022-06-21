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
  { text: `A recent episode of the Conspirituality podcast called, ‘Elena Brower Could Stop Selling doTERRA,’ is a brilliant investigative report on Brower’s toxic mash-up of girl boss life coaching, yoga courses, and Multi-Level Marketing (MLM) schemes. However, the podcast also paints a picture that’s far bigger than Elena Brower. Matthew Remski elucidates the trend of these schemes being sold under the guise of, “a pseudo-feminism that pretends to uplift women while actually spiritualising the worst aspects of predatory capitalism.” When I first heard that sentence, I skipped back so I could listen to it again because it hit me so hard. It made me reflect on every MLM I’ve been invited to join. It made me think of the invitations to join women’s gifting circles, blessing looms, and lotuses – all of which are pyramid schemes in new age language.` },
  { text: `I’ve had a kink about wanting to be a good girl for my whole life. I just didn’t know it was a deep erotic desire. I thought I actually wanted to be good. When I was a little girl that meant being a good Christian and a good daughter. Later in life, it meant doing a good job of playing into tantric and spiritual conventions. More recently, I’ve been trying to be good by remaining in the bounds of woke etiquette. I also try to be good by doing my best to appear politically engaged and intelligent. I think being seen as intelligent is one of my kinks too. It holds a very specific kind of sexual charge for me.  The delightfully amusing thing about trying to be good, that quite often it doesn’t lead to good outcomes. I can see this so clearly in my own life.` },
];

let embeddedLabels = [];

const input = {
  text: "hippies",
};

async function getEmbedding(label, { pushToArray, model }) {
  const modelEndpoint = model || "text-similarity-curie-001";
  try {
    let time = Date.now();
    const response = await openai.createEmbedding( {
      model: modelEndpoint,
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
async function getAllEmbeddings(arr) {
  try {
    const promises = arr.map((label) =>
      getEmbedding(label, {
        pushToArray: true,
        model: "text-search-babbage-query-001",
      })
    );
    await Promise.all(promises);
    writeDoc("./openai/embeddings.json", JSON.stringify(embeddedLabels));
  } catch (error) {
    console.log(error.message);
  }
}

async function classifyInput() {
  try {
    const inputEmbedding = await getEmbedding(input, {
      pushToArray: false,
      model: "text-search-babbage-query-001",
    });
    if (checkLabels()) {
      embeddedLabels = storedEmbeddings;
    } else {
      await getAllEmbeddings(labels);
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

exports.getAllEmbeddings = getAllEmbeddings;
