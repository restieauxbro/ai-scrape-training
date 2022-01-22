const { compile } = require("html-to-text");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const got = require("got");
const fs = require("fs");
const slugify = require("slugify");
const competenzPages = require("./sites/competenz-pages.json");

let totalWords = 0;

const convert = compile({
  wordwrap: null,
  selectors: [
    {
      selector: "a",
      options: { ignoreHref: true },
    },
    { selector: "h1", options: { uppercase: false } },
    { selector: "h2", options: { uppercase: false } },
    { selector: "h3", options: { uppercase: false } },
    { selector: "h4", options: { uppercase: false } },
    { selector: "h5", options: { uppercase: false } },
    { selector: ".like-dislike-cnt", format: "skip" },
    { selector: "img", format: "skip" },
    { selector: ".maori-title", format: "skip" },
    { selector: ".maori-divider", format: "skip" },
    { selector: ".btn", format: "skip" },
    { selector: "button", format: "skip" },
  ],
});

function tidyString(str) {
  return str.replace("U00A0", "").replace(/\n{2,}/g, "\n\n");
}

async function scrapeDom(webpage, i) {
  try {
    const response = await got(webpage);
    const dom = new JSDOM(response.body);
    // Create an Array out of the HTML Elements for filtering using spread syntax.
    const main = [
      ...dom.window.document.querySelectorAll(".col-sm-8, .col-sm-12"),
    ];
    const title = [...dom.window.document.querySelectorAll("h1")];
    const justText = tidyString(convert(main[0].innerHTML));
    const plainTitle = convert(title[0].innerHTML);
    const fullDoc = plainTitle + "\n\n" + justText;
    writeDoc(
      `./documents/${domainify(webpage)}/${slugify(plainTitle)}.txt`,
      fullDoc
    );
    addWordsToCount(fullDoc);
    return fullDoc;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
}

function addWordsToCount(str) {
  const stringLength = str.split(" ").length;
  const newCount = totalWords + stringLength;
  totalWords = newCount;
  console.log("Total words", totalWords);
}

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

const scrapeAllPages = async (arrOfPages) => {
  return Promise.all(arrOfPages.map((page, i) => scrapeDom(page, i)));
};

function domainify(url) {
  let domain = new URL(url);
  const host = domain.hostname.replace("www.", "").replace(".org.nz", "");
  return host;
}

async function index() {
  try {
    const response = await scrapeAllPages(competenzPages); // an array of pages' paragraph data
    writeDoc("./documents/masterdoc.json", JSON.stringify(response));
    // const jsonl = json.map((x) => JSON.stringify(x)).join("\n");
    // writeDoc("training-data-v1.jsonl", jsonl);
    return {};
  } catch (error) {
    console.log(error.message);
  }
}

index();
