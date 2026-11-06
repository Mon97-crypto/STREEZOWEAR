/**
 * Crawlers that collect web content for AI training or AI answers.
 * robots.txt asks them to stay out; middleware.ts refuses the ones that identify themselves.
 * Search engines (Googlebot, Bingbot, …) are NOT here, so the shop can still appear in search.
 * Some AI products (Google-Extended, Applebot-Extended) have no user agent of their own:
 * they can only be opted out through robots.txt, which is done below.
 */
export const AI_BOT_UAS = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot",
  "ClaudeBot", "Claude-Web", "Claude-User", "Claude-SearchBot", "anthropic-ai",
  "CCBot", "PerplexityBot", "Perplexity-User", "Bytespider", "Amazonbot",
  "meta-externalagent", "meta-externalfetcher", "FacebookBot",
  "cohere-ai", "cohere-training-data-crawler", "Diffbot", "ImagesiftBot", "Omgilibot", "Omgili",
  "YouBot", "Timpibot", "AI2Bot", "Ai2Bot-Dolma", "PanguBot", "Kangaroo Bot", "Scrapy", "img2dataset",
  "DuckAssistBot", "MistralAI-User", "Webzio-Extended", "Brightbot", "SemrushBot-OCOB",
] as const;

/** robots.txt-only opt-out tokens (not real user agents). */
export const AI_ROBOTS_TOKENS = ["Google-Extended", "Applebot-Extended", "GoogleOther"] as const;

const RE = new RegExp(AI_BOT_UAS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");

export function isAiBot(userAgent: string | null): boolean {
  return !!userAgent && RE.test(userAgent);
}
