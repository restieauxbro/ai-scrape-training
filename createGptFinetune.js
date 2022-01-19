const masterdoc = require("./documents/masterdoc.json");
const fs = require("fs");

function writeDoc(filename, body) {
  fs.writeFile(
    filename,
    body,
    {
      encoding: "utf8",
      flag: "w",
      mode: 0o666,
    },
    (err) => {
      if (err) throw err;
      console.log(`Wrote ${filename}`);
    }
  );
}

function jsonlConversion(arr) {
  const jsonl = arr
    .map((x) => JSON.stringify({ prompt: "", completion: x }))
    .join("\n");
  return jsonl;
}

function index() {
  writeDoc(
    "./jsonl/website-finetune.jsonl",
    jsonlConversion(masterdoc)
  );
}

index();
