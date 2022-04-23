const { compile } = require("html-to-text");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const got = require("got");
const fs = require("fs");
const slugify = require("slugify");
const amalaPages = require("../sites/amala-just-posts.json");
const axios = require("axios");

let totalWords = 0;

const convert = compile({
  wordwrap: null,
  selectors: [
    { selector: "h1", format: "skip" },
    { selector: "h2", options: { uppercase: false } },
    { selector: "h3", options: { uppercase: false } },
    { selector: "h4", options: { uppercase: false } },
    { selector: "h5", options: { uppercase: false } },
 //   { selector: "img", format: "skip" },
    { selector: ".post-navigation", format: "skip" },
    { selector: "#comments", format: "skip" },
    { selector: "button", format: "skip" },
  ],
});

async function scrapeDom(webpage) {
  try {
    const response = await got(webpage);
    const dom = new JSDOM(response.body);
    function getElement(elm) {
      return dom.window.document.querySelector(elm);
    }
    // Create an Array out of the HTML Elements for filtering using spread syntax.
    const main = getElement("main").innerHTML;
    const Preview = getElement('meta[name="description"]').content;
    const datePosted = new Date(
      getElement('meta[name="shareaholic:article_published_time"]').content
    );
    const Title = getElement("h1").innerHTML;
    const Content = convert(main);
    const Slug = slugify(Title);

    const articleObj = {
      Title,
      Slug,
      Preview,
      Date: datePosted,
      Content,
    };
    console.log(Content);

    // const { data } = await axios.post(
    //   "https://amala-backend.herokuapp.com/api/articles",
    //   { data: articleObj }
    // );
    // console.log(data);
    // console.log(`Uploaded ${Title}`);
    return main;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
}
scrapeDom(
  `http://ariamala.com/index.php/2017/10/26/may-all-the-blossoms-within-you-unfurl/`
);

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
  return Promise.all(arrOfPages.map((page, i) => scrapeDom(page)));
};

async function index() {
  try {
    const response = await scrapeAllPages(amalaPages); // an array of pages' paragraph data
    //  writeDoc("./documents/masterdoc.json", JSON.stringify(response));
    console.log(response);
    return response;
  } catch (error) {
    console.log(error.message);
  }
}

//index();
