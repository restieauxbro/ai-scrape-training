const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const got = require("got");
const GetSitemapLinks = require("get-sitemap-links").default;
const fs = require("fs");
const amalaPages = require("../sites/ari-amala.json");

const sitemaps = [
  "http://ariamala.com/index.php?xml_sitemap=params=misc",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2021-11",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2021-10",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2021-09",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2021-08",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2021-06",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2021-04",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2021-03",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2021-02",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2020-04",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2019-05",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2019-04",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2019-03",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2019-01",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2018-10",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2018-09",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2018-01",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2017-11",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2017-10",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2017-08",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2017-07",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2017-06",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2017-05",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2017-04",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2017-03",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2017-02",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2017-01",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2016-10",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2016-09",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2016-08",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2016-06",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-post-2016-05",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-page-2020-04",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-page-2018-09",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-page-2017-10",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-page-2017-03",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-page-2016-12",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-page-2016-07",
  "http://ariamala.com/index.php?xml_sitemap=params=pt-page-2016-04",
];

let websitePages = [];

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

const crawl = async (page) => {
  const array = await GetSitemapLinks(page);
  if (array.length === 0) {
    console.log("This one has no links", page);
  }
  websitePages.push(array);
  console.log(websitePages.length);
};

const scrapeAllPages = async (arrOfPages) => {
  return Promise.all(arrOfPages.map((page, i) => crawl(page)));
};

const index = async () => {
  await scrapeAllPages(sitemaps);
  writeDoc("./sites/ari-amala.json", JSON.stringify(websitePages));
};

const filtered = amalaPages.flat().filter((x) => x.indexOf("20") >= 0);
writeDoc('./sites/amala-just-posts.json', JSON.stringify(filtered))
