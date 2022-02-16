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
// uploadFile("./jsonl/website-finetune.jsonl", "fine-tune");

async function finetuneJob(uploadedFile) {
  // purpose can be answers, search, classifications, or fine-tune
  try {
    const response = await openai.createFineTune({
      training_file: uploadedFile
    });
    const data = response;
    console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
}

finetuneJob('file-Kzb5c8NfDWqJ9KRgyrzwVwTR')
