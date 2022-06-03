const masterdoc = require("./documents/masterdoc.json");
const fs = require("fs");
const { readSupabase } = require("./supabase");

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

function jsonlConversion(arr, { promptField, completion }) {
  // the promptField is a column name from the supabase entry, and completion is a function that takes the row as an argument and returns a string
  const jsonl = arr
    .map((row) =>
      JSON.stringify({
        prompt: promptField ? row[promptField] : "",
        completion: completion(row) || row,
      })
    )
    .join("\n");
  return jsonl;
}

async function formatData() {
  const data = await readSupabase("internal_job_profiles");
  const formatted = jsonlConversion(data, {
    promptField: "title",
    completion: (row) => {
      return `WHAT THEY WILL DO:\n\n${row["do"]}\n\nWHAT THEY WILL BE:\n\n${row["be"]}\n\nWHAT THEY WILL HAVE:\n\n${row["have"]}\n\n
      `;
    },
  });
  console.log(formatted);
  return formatted;
}

async function index() {
  try {
    const docData = await formatData();
    writeDoc("./jsonl/job-profiles.jsonl", docData);
  } catch (error) {
    console.log(error.message);
  }
}

index();
