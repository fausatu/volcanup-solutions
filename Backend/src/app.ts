import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { articlesRouter } from "./routes/articles.routes";
import { healthRouter } from "./routes/health.routes";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", healthRouter);
app.use("/api", authRouter);
app.use("/api", articlesRouter);

export { app };
