import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
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
