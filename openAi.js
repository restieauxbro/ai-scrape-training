const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const fs = require("fs");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function listFiles() {
  try {
    const response = await openai.listFiles();
    const data = response.data.data;
    console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
}
async function uploadFile(file, purpose) {
  // purpose can be answers, search, classifications, or fine-tune
  try {
    const response = await openai.createFile(
      fs.createReadStream(file),
      purpose
    );
    const data = response;
    console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
}
//  uploadFile("./spellCheckerAndSuggester/related-and-corrected.jsonl", "fine-tune");
// returned file-IejjUasW2zZCJZiHDTYSvlQN

async function finetuneJob(uploadedFile) {
  try {
    const response = await openai.createFineTune({
      training_file: uploadedFile,
      model: "babbage",
      suffix: "related-and-corrected-terms",
    });
    const { data } = response;
    console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
}
// finetuneJob("file-IejjUasW2zZCJZiHDTYSvlQN");
// returned curie:ft-restio:job-profiles-v2-2022-06-15-02-55-55

async function listGPTFineTunes() {
  try {
    const response = await openai.listFineTunes();
    const { data } = response.data;
    console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
}

listGPTFineTunes()