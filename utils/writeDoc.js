
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

module.exports = function writeDoc(filename, body) {
  writeDoc(filename, body);
}