// Servidor local para ver o app no navegador do PC: node tools/serve.js  → http://localhost:8123
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..", "app");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".woff2": "font/woff2", ".xml": "text/xml" };
http.createServer((req, res) => {
  const p = path.normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^([\\/]\.\.)+/, "");
  const file = path.join(root, p === path.sep || p === "/" ? "index.html" : p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(8123, () => console.log("IPTV em http://localhost:8123"));
