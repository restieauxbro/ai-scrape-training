const { createClient } = require("@supabase/supabase-js");
const corrections = require("./corrections");
const suggested = require("./suggested.json");
const fs = require("fs");
const writeDoc = require("../utils/writeDoc");

const supabaseUrl = "https://exglnvnbkodfbtxqzwqf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Z2xudm5ia29kZmJ0eHF6d3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTA0MTc1MTksImV4cCI6MTk2NTk5MzUxOX0.o_VIGEFOeoOncABoSaH8bZVXkteEKc2piC8Lti_lbGM";
const supabase = createClient(supabaseUrl, supabaseKey);

async function getSearchTerms() {
  try {
    let { data: search_terms, error } = await supabase
      .from("search_terms")
      .select("term")
      .eq("is_preferred", true);
    const justStrings = search_terms.map((term) => term.term);
    console.log(justStrings);
    return justStrings;
  } catch (error) {
    console.log(error.message);
  }
}

async function getSuggestedTerms(arr) {
  // str from array in the format 'query.eq.Manufacturing,query.eq.engineering' and so on
  const str = arr.map((term) => `query.eq.${term}`).join(",");
  console.log(str);
  try {
    let { data: suggested_programme_terms, error } = await supabase
      .from("suggested_programme_terms")
      .select("query, suggested_terms")
      .or(str);
    console.log(
      suggested_programme_terms,
      "length",
      suggested_programme_terms.length
    );
    return suggested_programme_terms;
  } catch (error) {
    console.log(error.message);
  }
}

async function getPreferredSuggestions() {
  try {
    let search_terms = await getSearchTerms();
    const suggested = await getSuggestedTerms(search_terms);
    //  writeDoc("suggested.json", JSON.stringify(suggested));
  } catch (error) {
    console.log(error.message);
  }
}

function jsonLinesFromCorrections(corrections) {
  return corrections
    .map(([query, correction]) => {
      return `{"prompt":${JSON.stringify(
        `${query}\n`
      )},"completion":${JSON.stringify(`\nCorrected: ${correction}`)}}`;
    })
    .join("\n");
}

function jsonLinesFromSuggested(suggested) {
  return suggested
    .map(({ query, suggested_terms }) => {
      return `{"prompt":${JSON.stringify(
        `${query}\n`
      )},"completion":${JSON.stringify(
        `\nSuggested: ${suggested_terms.join(", ")}`
      )}}`;
    })
    .join("\n");
}

const jsonlDocument =
  jsonLinesFromCorrections(corrections) +
  "\n" +
  jsonLinesFromSuggested(suggested);

//console.log(JSON.stringify(jsonlDocument));

fs.writeFile(
  "./spellCheckerAndSuggester/related-and-corrected.jsonl",
  jsonlDocument,
  function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  }
);
