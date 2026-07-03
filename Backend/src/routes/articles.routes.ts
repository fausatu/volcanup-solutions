import { Router } from "express";
import { SocialNetwork } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdminAuth } from "../middleware/auth.middleware";

const articleInputSchema = z.object({
  title: z.string().min(3).max(160),
  url: z.string().url(),
  category: z.string().min(2).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  socialNetwork: z.nativeEnum(SocialNetwork)
});

function buildAutoText(url: string): string {
  return `Extrait automatique a enrichir pour ${url}`;
}

function buildAutoImage(url: string): string | null {
  const isLinkedIn = url.includes("linkedin.com");
  return isLinkedIn ? "https://dummyimage.com/1200x628/e2e8f0/334155&text=LinkedIn+Post" : null;
}

const articlesRouter = Router();

articlesRouter.get("/articles", async (_req, res) => {
  const articles = await prisma.article.findMany({
    orderBy: { date: "desc" }
  });

  const response = articles.map((article) => ({
    ...article,
    date: article.date.toISOString().slice(0, 10)
  }));

  res.status(200).json(response);
});

articlesRouter.post("/admin/articles", requireAdminAuth, async (req, res) => {
  const parsed = articleInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Payload article invalide",
      issues: parsed.error.issues
    });
    return;
  }

  const data = parsed.data;

  const article = await prisma.article.create({
    data: {
      title: data.title,
      url: data.url,
      category: data.category,
      date: new Date(`${data.date}T00:00:00.000Z`),
      socialNetwork: data.socialNetwork,
      autoText: buildAutoText(data.url),
      autoImageUrl: buildAutoImage(data.url)
    }
  });

  res.status(201).json({
    ...article,
    date: article.date.toISOString().slice(0, 10)
  });
});

export { articlesRouter };
