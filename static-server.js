const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const rootDir = path.resolve(__dirname);
const port = process.env.PORT || 5500;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function shouldCompress(contentType) {
  return /^(text\/|application\/(javascript|json|xml)|image\/svg\+xml|font\/woff2?|font\/otf|font\/ttf)/.test(contentType);
}

function sendFile(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";
  const headers = {
    "Content-Type": contentType,
    Vary: "Accept-Encoding",
  };

  if (ext === ".html") {
    headers["Cache-Control"] = "no-cache";
  } else {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  }

  const acceptEncoding = req.headers["accept-encoding"] || "";
  let stream = fs.createReadStream(filePath);

  if (shouldCompress(contentType) && acceptEncoding.includes("br")) {
    headers["Content-Encoding"] = "br";
    res.writeHead(200, headers);
    stream.pipe(zlib.createBrotliCompress()).pipe(res);
  } else if (shouldCompress(contentType) && acceptEncoding.includes("gzip")) {
    headers["Content-Encoding"] = "gzip";
    res.writeHead(200, headers);
    stream.pipe(zlib.createGzip()).pipe(res);
  } else {
    res.writeHead(200, headers);
    stream.pipe(res);
  }

  stream.on("error", () => {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  });
}

function handleRequest(req, res) {
  const requestUrl = decodeURIComponent(req.url.split("?")[0]);
  let filePath = path.join(rootDir, requestUrl);

  if (filePath.endsWith(path.sep) || requestUrl === "/") {
    filePath = path.join(filePath, "index.html");
  }

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(rootDir, "index.html");
  }

  sendFile(req, res, filePath);
}

const server = http.createServer(handleRequest);

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}`);
  console.log("Compression enabled for text and font resources.");
});
