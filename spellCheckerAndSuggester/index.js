const { createClient } = require("@supabase/supabase-js");
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
      .eq("is_preferred", false)
      .limit(100)
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
    console.log(suggested_programme_terms);
    return suggested_programme_terms;
  } catch (error) {
    console.log(error.message);
  }
}

async function index() {
  try {
    let search_terms = await getSearchTerms();
    const suggested = await getSuggestedTerms(search_terms);
  //  writeDoc("suggested.json", JSON.stringify(suggested));
  } catch (error) {
    console.log(error.message);
  }
}

index();
