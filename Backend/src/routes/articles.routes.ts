import { randomUUID } from "crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAdminAuth } from "../middleware/auth.middleware";
import { Article } from "../types/article";

const articleInputSchema = z.object({
  title: z.string().min(3).max(160),
  url: z.string().url(),
  category: z.string().min(2).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  socialNetwork: z.enum(["linkedin", "facebook", "instagram", "x"])
});

const articles: Article[] = [];

function buildAutoText(url: string): string {
  return `Extrait automatique a enrichir pour ${url}`;
}

function buildAutoImage(url: string): string | null {
  const isLinkedIn = url.includes("linkedin.com");
  return isLinkedIn ? "https://dummyimage.com/1200x628/e2e8f0/334155&text=LinkedIn+Post" : null;
}

const articlesRouter = Router();

articlesRouter.get("/articles", (_req, res) => {
  const sorted = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));
  res.status(200).json(sorted);
});

articlesRouter.post("/admin/articles", requireAdminAuth, (req, res) => {
  const parsed = articleInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Payload article invalide",
      issues: parsed.error.issues
    });
    return;
  }

  const data = parsed.data;

  const article: Article = {
    id: randomUUID(),
    title: data.title,
    url: data.url,
    category: data.category,
    date: data.date,
    socialNetwork: data.socialNetwork,
    autoText: buildAutoText(data.url),
    autoImageUrl: buildAutoImage(data.url),
    createdAt: new Date().toISOString()
  };

  articles.unshift(article);
  res.status(201).json(article);
});

export { articlesRouter };
