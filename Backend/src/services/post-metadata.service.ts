import axios from "axios";
import * as cheerio from "cheerio";

type ExtractedMetadata = {
  autoText: string;
  autoImageUrl: string | null;
};

const FALLBACK_IMAGE = "https://dummyimage.com/1200x628/e2e8f0/334155&text=LinkedIn+Post";
const AUTO_EXCERPT_MAX_LENGTH = 360;
const LINKEDIN_GATED_TEXT_MARKERS = [
  "identifiez-vous",
  "inscrivez-vous",
  "sign in",
  "join now"
];

function pickFirstNonEmpty(values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength = AUTO_EXCERPT_MAX_LENGTH): string {
  if (value.length <= maxLength) {
    return value;
  }

  const chunk = value.slice(0, maxLength);
  const safeChunk = chunk.slice(0, Math.max(0, chunk.lastIndexOf(" ")));
  return `${safeChunk || chunk}...`;
}

function normalizeSharedUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function buildReadableFallback(url: string): string {
  try {
    const parsed = new URL(url);
    const path = decodeURIComponent(parsed.pathname);

    // Handles links such as /posts/<author>_...-ugcPost-1234567890-xxxx
    const postSlugMatch = path.match(/\/posts\/([^/]+)/i);
    const feedActivityMatch = path.match(/activity:(\d+)/i);

    if (postSlugMatch?.[1]) {
      const cleaned = postSlugMatch[1]
        .replace(/_+/g, " ")
        .replace(/-ugcpost-\d+.*$/i, "")
        .replace(/-g\d+[a-z0-9]*$/i, "")
        .replace(/-{2,}/g, "-")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (cleaned.length >= 18) {
        return truncate(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
      }
    }

    if (feedActivityMatch?.[1]) {
      return `Publication LinkedIn (activite ${feedActivityMatch[1]})`;
    }

    return "Publication reseau social";
  } catch {
    return "Publication reseau social";
  }
}

function isGatedDescription(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.toLowerCase();
  return LINKEDIN_GATED_TEXT_MARKERS.some((marker) => normalized.includes(marker));
}

export async function extractPostMetadata(url: string): Promise<ExtractedMetadata> {
	const normalizedUrl = normalizeSharedUrl(url);
	const fallbackText = buildReadableFallback(normalizedUrl);

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

    const usableDescription = !isGatedDescription(description) ? description : undefined;
    const autoText = usableDescription ? truncate(cleanText(usableDescription)) : fallbackText;
    const autoImageUrl = image || (normalizedUrl.includes("linkedin.com") ? FALLBACK_IMAGE : null);

    return { autoText, autoImageUrl };
  } catch {
    return {
      autoText: fallbackText,
      autoImageUrl: normalizedUrl.includes("linkedin.com") ? FALLBACK_IMAGE : null
    };
  }
}
