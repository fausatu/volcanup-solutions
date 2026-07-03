import axios from "axios";
import * as cheerio from "cheerio";

type ExtractedMetadata = {
  autoText: string;
  autoImageUrl: string | null;
};

const FALLBACK_IMAGE = "https://dummyimage.com/1200x628/e2e8f0/334155&text=LinkedIn+Post";

function pickFirstNonEmpty(values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength = 220): string {
  if (value.length <= maxLength) {
    return value;
  }

  const chunk = value.slice(0, maxLength);
  const safeChunk = chunk.slice(0, Math.max(0, chunk.lastIndexOf(" ")));
  return `${safeChunk || chunk}...`;
}

export async function extractPostMetadata(url: string): Promise<ExtractedMetadata> {
  const fallbackText = `Extrait automatique a enrichir pour ${url}`;

  try {
    const response = await axios.get<string>(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"
      }
    });

    const $ = cheerio.load(response.data || "");

    const description = pickFirstNonEmpty([
      $("meta[property='og:description']").attr("content"),
      $("meta[name='twitter:description']").attr("content"),
      $("meta[name='description']").attr("content")
    ]);

    const image = pickFirstNonEmpty([
      $("meta[property='og:image']").attr("content"),
      $("meta[name='twitter:image']").attr("content")
    ]);

    const autoText = description ? truncate(cleanText(description)) : fallbackText;
    const autoImageUrl = image || (url.includes("linkedin.com") ? FALLBACK_IMAGE : null);

    return { autoText, autoImageUrl };
  } catch {
    return {
      autoText: fallbackText,
      autoImageUrl: url.includes("linkedin.com") ? FALLBACK_IMAGE : null
    };
  }
}
