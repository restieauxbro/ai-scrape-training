const { compile } = require("html-to-text");
//const got = require("got");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const got = require("got");
const fs = require("fs");

const pages = [
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/fabrication/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/general-engineering/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/machining/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/fitting-and-machining/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/maintenance-engineering/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/toolmaking/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/metal-forming/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/dairy-systems/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/fire-protection/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/mechanical-building-services/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/refrigeration-and-air-conditioning/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/engineering/locksmithing/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/food-and-beverage/food-and-beverage-manufacturing/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/food-and-beverage/cellar-operations/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/food-and-beverage/bakery/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/forestry/harvesting/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/forestry/silviculture/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/manufacturing/general-manufacturing/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/manufacturing/plastics/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/manufacturing/solid-wood/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/manufacturing/wood-panels/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/manufacturing/pulp-and-paper/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/manufacturing/furniture/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/print-packaging-and-signmaking/print/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/print-packaging-and-signmaking/packaging/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/print-packaging-and-signmaking/signmaking/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/textiles-apparel-and-laundry/textiles/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/textiles-apparel-and-laundry/apparel/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/textiles-apparel-and-laundry/laundry/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/transport/rail/",
  "https://www.competenz.org.nz/jobseekers/industries-for-jobseekers/transport/maritime/",
];

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
  ],
});

async function scrapeDom(webpage, i) {
  try {
    const response = await got(webpage);
    const dom = new JSDOM(response.body);
    // Create an Array out of the HTML Elements for filtering using spread syntax.
    const main = [...dom.window.document.querySelectorAll(".col-sm-8")];
    const title = [...dom.window.document.querySelectorAll("#hero h1")];
    const justText = convert(main[0].innerHTML).replace(/\n{2,}/g, "\n\n");
    const plainTitle = convert(title[0].innerHTML);

    const fullDoc = plainTitle + "\n\n" + justText;
    writeDoc(`./documents/${i}.txt`, fullDoc);
    return fullDoc;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
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

async function index() {
  try {
    const response = await scrapeAllPages(pages); // an array of pages' paragraph data
    writeDoc("./documents/masterdoc.json", JSON.stringify(response));
    // const jsonl = json.map((x) => JSON.stringify(x)).join("\n");
    // writeDoc("training-data-v1.jsonl", jsonl);
    return {
      // statusCode: 200,
      // body: JSON.stringify(jsonl),
    };
  } catch (error) {
    console.log(error.message);
  }
}

index();
