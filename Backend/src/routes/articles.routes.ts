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
  socialNetwork: z.enum(["linkedin", "facebook", "instagram", "x"]),
  excerpt: z.string().min(30).max(500).optional()
});

const articleIdParamSchema = z.object({
  id: z.string().cuid()
});

function buildSafeExcerpt(title: string, socialNetwork: string): string {
  const networkLabel = socialNetwork ? socialNetwork.charAt(0).toUpperCase() + socialNetwork.slice(1) : "reseau social";
  const trimmedTitle = String(title || "").trim();

  if (trimmedTitle.length >= 12) {
    return `Apercu de la publication: ${trimmedTitle}.`;
  }

  return `Apercu de publication ${networkLabel}.`;
}

function normalizeExcerpt(value: string | null | undefined, title: string, socialNetwork: string): string {
  const text = String(value || "").replace(/\s+/g, " ").trim();

  if (!text) {
    return buildSafeExcerpt(title, socialNetwork);
  }

  const isLegacyPlaceholder = /^extrait automatique\s+/i.test(text);
  const hasUrl = /https?:\/\//i.test(text);
  const urlRatio = text.replace(/https?:\/\/\S+/gi, "").trim().length / text.length;
  const looksLikeNoisyFallback = hasUrl && urlRatio < 0.65;

  if (isLegacyPlaceholder || looksLikeNoisyFallback) {
    return buildSafeExcerpt(title, socialNetwork);
  }

  return text;
}

const articlesRouter = Router();

articlesRouter.get("/articles", async (_req, res) => {
  const articles = await prisma.article.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }]
  });

  const response = articles.map((article: any) => ({
    ...article,
    autoText: normalizeExcerpt(article.autoText, article.title, String(article.socialNetwork || "")),
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
      autoText: normalizeExcerpt(data.excerpt || metadata.autoText, data.title, data.socialNetwork),
      autoImageUrl: metadata.autoImageUrl
    }
  });

  res.status(201).json({
    ...article,
    date: article.date.toISOString().slice(0, 10)
  });
});

articlesRouter.delete("/admin/articles/:id", requireAdminAuth, async (req, res) => {
  const parsedParams = articleIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json({
      message: "Identifiant article invalide",
      issues: parsedParams.error.issues
    });
    return;
  }

  const existing = await prisma.article.findUnique({
    where: { id: parsedParams.data.id },
    select: { id: true }
  });

  if (!existing) {
    res.status(404).json({ message: "Article introuvable" });
    return;
  }

  await prisma.article.delete({
    where: { id: parsedParams.data.id }
  });

  res.status(200).json({
    message: "Article supprime",
    id: parsedParams.data.id
  });
});

export { articlesRouter };
