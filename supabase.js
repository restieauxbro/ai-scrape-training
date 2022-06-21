const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://exglnvnbkodfbtxqzwqf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Z2xudm5ia29kZmJ0eHF6d3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTA0MTc1MTksImV4cCI6MTk2NTk5MzUxOX0.o_VIGEFOeoOncABoSaH8bZVXkteEKc2piC8Lti_lbGM";
const supabase = createClient(supabaseUrl, supabaseKey);

async function readSupabase(tableName) {
  try {
    let { data, error } = await supabase.from(tableName).select("*");
    return data;
  } catch (error) {
    console.log(error.message);
  }
}

async function upsertToDB(tableName, values, { onConflictColumn }) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .upsert(values, { onConflict: onConflictColumn, returning: "minimal" });
    if (!error) {
      console.log("Upserted", values.length, "rows to", tableName);
    }
    else console.log(error.message);
    return data;
  } catch (error) {
    console.log(error.message);
  }
}

exports.readSupabase = readSupabase;
exports.upsertToDB = upsertToDB;
