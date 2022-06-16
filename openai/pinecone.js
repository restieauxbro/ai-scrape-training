const axios = require("axios");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const apiKey = process.env.PINECONE_API_KEY;
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const pineconeEndpoint = "https://items-4083e0d.svc.us-west1-gcp.pinecone.io/";
const pineconeUpsertEndpoint = pineconeEndpoint + "vectors/upsert";
const pineconeQueryEndpoint = pineconeEndpoint + "query";

let labels = [
  {
    title: "Ari Amala",
    slug: "",
    text: `A recent episode of the Conspirituality podcast called, ‘Elena Brower Could Stop Selling doTERRA,’ is a brilliant investigative report on Brower’s toxic mash-up of girl boss life coaching, yoga courses, and Multi-Level Marketing (MLM) schemes. However, the podcast also paints a picture that’s far bigger than Elena Brower. Matthew Remski elucidates the trend of these schemes being sold under the guise of, “a pseudo-feminism that pretends to uplift women while actually spiritualising the worst aspects of predatory capitalism.” When I first heard that sentence, I skipped back so I could listen to it again because it hit me so hard. It made me reflect on every MLM I’ve been invited to join. It made me think of the invitations to join women’s gifting circles, blessing looms, and lotuses – all of which are pyramid schemes in new age language.`,
  },
  {
    title: "A Cauldron full of Seething Excitations",
    slug: "a-cauldron-full-of-seething-excitations",
    text: `I’ve had a kink about wanting to be a good girl for my whole life. I just didn’t know it was a deep erotic desire. I thought I actually wanted to be good. When I was a little girl that meant being a good Christian and a good daughter. Later in life, it meant doing a good job of playing into tantric and spiritual conventions. More recently, I’ve been trying to be good by remaining in the bounds of woke etiquette. I also try to be good by doing my best to appear politically engaged and intelligent. I think being seen as intelligent is one of my kinks too. It holds a very specific kind of sexual charge for me.  The delightfully amusing thing about trying to be good, that quite often it doesn’t lead to good outcomes. I can see this so clearly in my own life.`,
  },
];
let embeddedLabels = [];

async function getEmbedding(label, { pushToArray, model }) {
  const modelEndpoint = model || "text-similarity-curie-001";
  const uniqueId =
    Math.random().toString(36).substring(2, 15) + "-" + Date.now();
  const { text, title, slug } = label;
  try {
    let time = Date.now();
    const response = await openai.createEmbedding(modelEndpoint, {
      input: label.text,
    });
    const { data } = response.data;
    const embedding = data[0].embedding;
    const pineconeFormattedVector = {
      id: slug,
      metadata: { title, text, slug },
      values: embedding,
    };
    if (pushToArray) {
      embeddedLabels.push(pineconeFormattedVector);
    }
    console.log(
      Date.now() - time,
      "ms to get embedding for label: ",
      label.text
    );
    return pineconeFormattedVector;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}
async function getAllEmbeddings(arr) {
  try {
    const promises = arr.map((label) =>
      getEmbedding(label, {
        pushToArray: true,
        model: "text-search-curie-doc-001",
      })
    );
    await Promise.all(promises);
    return embeddedLabels;
  } catch (error) {
    console.log(error.message);
  }
}

async function postToAPI(vectors, namespace) {
  try {
    const headers = {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    };
    const body = {
      vectors,
      namespace,
    };
    const response = await axios.post(pineconeUpsertEndpoint, body, {
      headers,
    });
    const data = response.data;
    console.log(data);
    return data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}
async function postEmbeddings() {
  try {
    const embeddings = await getAllEmbeddings(labels);
    console.log(embeddings);
    await postToAPI(embeddings, "ari-amala-articles");
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}
// postEmbeddings();

// QUERYING THE PINECONE VECTOR DATABASE

async function pineconeQueryArticle(articleObj) {
  try {
    const queryEmbedding = await getEmbedding(articleObj, {
      model: "text-search-curie-query-001",
    });
    console.log(queryEmbedding.values);
    await pineconeQuery(queryEmbedding.values, "ari-amala-articles");
  } catch (error) {
    console.log(error.message);
  }
}
async function pineconeQuery(vector, namespace) {
  const time = Date.now();
  try {
    const headers = {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    };
    const body = {
      vector,
      namespace,
      topK: 5,
      includeMetadata: true,
      includeValues: true,
    };
    const response = await axios.post(pineconeQueryEndpoint, body, { headers });
    const data = response.data.matches.map(({ score, metadata }) => ({
      score,
      metadata
    }));
    console.log(data, "in ", Date.now() - time, "ms");
  } catch (error) {
    console.log(error.message);
  }
}
pineconeQueryArticle({ text: "scam" });
// IDs existing: liyikilg2ie-1654594845255, nf9j8m4847r-1654594845255
