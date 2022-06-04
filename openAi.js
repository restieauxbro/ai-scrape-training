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
// uploadFile("./jsonl/job-profiles.jsonl", "fine-tune");
// returned file-Oo8A9hvERZHgURwxzsFswaGs

async function finetuneJob(uploadedFile) {
  try {
    const response = await openai.createFineTune({
      training_file: uploadedFile,
      suffix: "job-profiles-v1",
    });
    const { data } = response;
    console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
}
// finetuneJob("file-Oo8A9hvERZHgURwxzsFswaGs");
// returned curie:ft-restio:job-profiles-v1-2022-06-03-05-43-18

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

listGPTFineTunes();


