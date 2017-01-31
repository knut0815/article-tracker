const fs = require("fs");
const fse = require("fs-extra");
const urli = require("url");
const Diff = require("text-diff");
const request = require("request");
const html_parser = require("htmlparser");

const url = "http://www.spiegel.de/wissenschaft/mensch/luftverschmutzung-2016-zahlreiche-staedte-ueberschreiten-grenzwert-a-1132445.html";
const differ = new Diff();

const getIdFromUrl = (str) => {
  return str.slice(str.lastIndexOf("-")+1, str.length).replace(".html", "");
};

const getHostFromUrl = (str) => {
  let data = urli.parse(str);
  let host = data.hostname;
  let out = host;
  out = out.replace("www.", "");
  out = out.replace(/[.]/g, "_");
  return out;
};

const base_name = getIdFromUrl(url);
const base_path = `${process.cwd()}/data/${getHostFromUrl(url)}/`;
const full_data_path = base_path + base_name + ".json";

const tmpl = {
  category: [],
  headline: "",
  description: "",
  headlineShort: "",
  content: "",
  revision: 0,
  changes: [],
  url: url,
  id: base_name,
  creation: ""
};

fse.ensureDirSync(base_path);

const deep = (obj, node) => {
  if (node.attribs) {
    // creation
    if (node.attribs.class === "timeformat") {
      obj.creation = +new Date(node.attribs.datetime);
    }
    // type
    if (node.attribs.class === "breadcrumb-history list-float clearfix") {
      node.children.map((child) => {
        if (child.name === "li") {
          child = child.children[2];
          if (child && child.name === "a") {
            obj.category.push(child.children[0].data);
          }
        }
      });
    }
    // description
    if (node.attribs.class === "article-intro") {
      //console.log("Description:");
      node.children.map((child) => {
        obj.description = child.children[0].data;
      });
    }
    // content
    if (node.attribs.class === "article-section clearfix") {
      //console.log("Content:");
      node.children.map((child) => {
        if (child.name === "p") {
          child.children.map((node) => {
            if (node.name === "a") {
              obj.content += node.children[0].data;
            }
            else if (node.name === "b") {
              obj.content += "<b>";
              obj.content += node.children[0].data;
              obj.content += "</b>";
            }
            else if (node.name === "i") {
              obj.content += "<i>";
              obj.content += node.children[0].data;
              obj.content += "</i>";
            }
            else {
              obj.content += node.data;
            }
          });
        }
      });
    }
  }
  if (node.name === "span" && node.attribs) {
    // headline
    if (node.attribs.class === "headline") {
      //console.log("Headline:");
      obj.headline = node.children[0].raw;
    }
    // headline short
    if (node.attribs.class === "headline-intro") {
      //console.log("Headline short:");
      obj.headlineShort = node.children[0].raw;
    }
  }
  if (node.children) node.children.map((child) => deep(obj, child));
};

request(url, (error, response, body) => {
  if (error) throw new Error(error);
  analyze(body);
  return void 0;
  if (error) {
    console.log(error);
    return void 0;
  }
  if (!error && response.statusCode === 200) {
    analyze(body);
  }
});

const apply_changes = (a, b, is_first) => {
  let changes = [];
  if (is_first) {
    fs.writeFileSync(full_data_path, JSON.stringify(b, null, 2), "utf-8");
    return changes;
  }
  let now = Date.now();
  for (let key in a) {
    if (key === "changes") continue;
    let before = String(a[key]);
    let after = String(b[key]);
    let diffs = differ.main(before, after);
    diffs.map((item) => {
      if (item[0] === 0) return;
      changes.push({
        kind: item[0],
        value: item[1],
        date: now
      });
    });
  };
  if (changes.length) a.revision++;
  return changes;
};

const analyze = (body) => {
  let base = null;
  try {
   base = JSON.parse(fs.readFileSync(full_data_path)); 
  } catch (e) {
    base = null;
  };
  let is_first_revision = base === null;
  const handler = new html_parser.DefaultHandler((error, nodes) => {
    nodes.map((child) => deep(tmpl, child));
    let changes = apply_changes(base, tmpl, is_first_revision);
    tmpl.changes = base ? base.changes : [];
    changes.map((change) => {
      tmpl.changes.push(change);
    });
    fs.writeFileSync(full_data_path, JSON.stringify(tmpl, null, 2), "utf-8");
  });
  const parser = new html_parser.Parser(handler).parseComplete(body);
};