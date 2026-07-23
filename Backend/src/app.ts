import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import path from "path";
import axios from "axios";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { articlesRouter } from "./routes/articles.routes";
import { healthRouter } from "./routes/health.routes";

const app = express();

const configuredOrigin = env.CLIENT_ORIGIN;
const localhostVariant = configuredOrigin.replace("127.0.0.1", "localhost");
const loopbackVariant = configuredOrigin.replace("localhost", "127.0.0.1");
const allowedOrigins = new Set([configuredOrigin, localhostVariant, loopbackVariant]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow direct API calls (curl/postman) and configured local front origins.
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin non autorisee: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

// Serve frontend static assets with a long cache TTL (1 year) and immutable flag.
// Assets directory is located one level above the Backend folder.
const assetsDir = path.join(process.cwd(), "..", "Assets");
app.use(
  "/Assets",
  express.static(assetsDir, {
    maxAge: 31536000000, // 1 year in ms
    immutable: true
  })
);

// Simple image proxy for third-party images (caches on client via Cache-Control header)
// Usage: /proxy/image?url=<encoded-image-url>
app.get("/proxy/image", async (req: Request, res: Response) => {
  const url = String(req.query.url || "");
  if (!url) {
    res.status(400).send("Missing 'url' query parameter");
    return;
  }

  try {
    const response = await axios.get(url, { responseType: "stream" });
    const contentType = response.headers["content-type"] || "image/*";
    res.setHeader("Content-Type", contentType);
    // Let the browser cache this proxied image for a long time
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    response.data.pipe(res);
  } catch (error) {
    console.error("Proxy image error:", error?.toString?.() || error);
    res.status(502).send("Failed to fetch image");
  }
});

app.use("/api", healthRouter);
app.use("/api", authRouter);
app.use("/api", articlesRouter);

app.use((req, res) => {
  res.status(404).json({
    message: `Route introuvable: ${req.method} ${req.originalUrl}`
  });
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled API error:", error);

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(500).json({
    message: "Erreur serveur interne"
  });
});

export { app };
