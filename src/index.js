const req = require("./request");
const url = "http://www.spiegel.de/einestages/springfield-gotham-city-und-lummerland-fiktive-orte-a-1061254.html";

let urls = [
  "http://www.spiegel.de/einestages/springfield-gotham-city-und-lummerland-fiktive-orte-a-1061254.html",
  "http://www.spiegel.de/wirtschaft/soziales/brasilien-spart-wegen-wirtschaftskrise-beim-karneval-a-1071537.html",
  "http://www.spiegel.de/wirtschaft/soziales/gutachten-eu-kommission-soll-steuer-dokumente-freigeben-a-1070946.html"
];

let make_request = (idx) => {
  let url = urls[idx];
  req(url, (result) => {
    console.log(`Successfully loaded ${result.id}`);
    if (++idx < urls.length) make_request(idx);
  });
};

make_request(0);