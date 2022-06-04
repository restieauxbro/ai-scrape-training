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

function jsonlConversion(arr, { promptFunction, completionFunction }) {
  // the promptField is a column name from the supabase entry, and completion is a function that takes the row as an argument and returns a string
  const jsonl = arr
    .map((row) =>
      JSON.stringify({
        prompt: promptFunction(row) || "",
        completion: completionFunction(row) || row,
      })
    )
    .join("\n");
  return jsonl;
}

// Job Profiles for the GPT Finetune
async function formatData() {
  const data = await readSupabase("internal_job_profiles");
  const cleanedData = data
    .map((row) => {
      const { title, department, purpose, tasks, be, have } = row;
      function clean(text) {
        return text.replace("\\n", "\n").trim();
      }
      // clean text in all properties of the row
      return {
        title: clean(title),
        department: clean(department),
        purpose: clean(purpose),
        tasks: clean(tasks),
        be: clean(be),
        have: clean(have),
      };
    })
    .filter((row) => {
      // filter out rows that have no tasks or no be or no have
      return row.tasks && row.be && row.have;
    });
  const formatted = jsonlConversion(cleanedData, {
    promptFunction: ({ title, department, purpose }) => {
      return `Title: ${title}\nDepartment: ${department}\nPurpose: ${purpose}`;
    },
    completionFunction: (row) => {
      return `### WHAT THEY WILL DO: ###\n\n${row["tasks"]}\n\n### WHAT THEY WILL BE: ###\n\n${row["be"]}\n\n### WHAT THEY WILL HAVE: ###\n\n${row["have"]}
      `.trim();
    },
  });
  console.log(formatted);
  return formatted;
}

// ______________________________________________

async function index() {
  try {
    const docData = await formatData();
    writeDoc("./jsonl/job-profiles.jsonl", docData);
  } catch (error) {
    console.log(error.message);
  }
}

index();
