import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdminAuth } from "../middleware/auth.middleware";
import { extractPostMetadata } from "../services/post-metadata.service";

const articleInputSchema = z.object({
  title: z.string().min(3).max(160),
  url: z.string().url(),
  category: z.string().min(2).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  socialNetwork: z.enum(["linkedin", "facebook", "instagram", "x"])
});

const articlesRouter = Router();

articlesRouter.get("/articles", async (_req, res) => {
  const articles = await prisma.article.findMany({
    orderBy: { date: "desc" }
  });

  const response = articles.map((article: any) => ({
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
  const metadata = await extractPostMetadata(data.url);

  const article = await prisma.article.create({
    data: {
      title: data.title,
      url: data.url,
      category: data.category,
      date: new Date(`${data.date}T00:00:00.000Z`),
      socialNetwork: data.socialNetwork,
      autoText: metadata.autoText,
      autoImageUrl: metadata.autoImageUrl
    }
  });

  res.status(201).json({
    ...article,
    date: article.date.toISOString().slice(0, 10)
  });
});

export { articlesRouter };
