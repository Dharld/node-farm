const fs = require("fs");
const http = require("http");
const url = require("url");

///////////////////////////
// FILES

// Blocking, synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", {
//   encoding: "utf8",
// });
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;

// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written!");

// Non-blocking, asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", (_, data1) => {
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (_, data2) => {
//     console.log(data2);
//     fs.readFile("./txt/append.txt", "utf-8", (_, data3) => {
//       console.log(data3);
//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (_) => {
//         console.log("File written correctly!");
//       });
//     });
//   });
// });

///////////////////////////
// SERVER

function remplaceTemplate(temp, product) {
  let output = temp
    .replace(/{%PRODUCTNAME%}/g, product.productName)
    .replace(/{%IMAGE%}/g, product.image)
    .replace(/{%PRICE%}/g, product.price)
    .replace(/{%FROM%}/g, product.from)
    .replace(/{%NUTRIENTS%}/g, product.nutrients)
    .replace(/{%QUANTITY%}/g, product.quantity)
    .replace(/{%DESCRIPTION%}/g, product.description)
    .replace(/{%ID%}/g, product.id);

  if (!product.organic) {
    output.replace(/{%NOT_ORGANIC%}/g, product.not_organic);
  } else {
    output.replace(/{%NOT_ORGANIC%}/g, "");
  }
  return output;
}

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const products = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { query, pathname: pathName } = url.parse(req.url, true);

  // Overview page
  if (pathName == "/" || pathName == "/overview") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    const cardsHTML = products
      .map((product) => remplaceTemplate(tempCard, product))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHTML);
    res.end(output);
  }
  // Product page
  else if (pathName == "/product") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    // get the product
    const id = query.id;
    const product = products[+id];
    console.log(product);

    // replace the template
    const output = remplaceTemplate(tempProduct, product);
    res.end(output);
  }
  // API
  else if (pathName == "/api") {
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(data);
  }
  // Not found
  else {
    res.writeHead(404, {
      "Content-type": "text/html",
    });
    res.end("Page not found!");
  }
});

server.listen(3000, () => {
  console.log("Server is listening at port 3000");
});
