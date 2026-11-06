import { NextResponse, type NextRequest } from "next/server";
import { isAiBot } from "@/lib/security/ai-bots";

/** Refuse AI crawlers that identify themselves (they get a 403 and none of the site). */
export function middleware(req: NextRequest) {
  if (isAiBot(req.headers.get("user-agent"))) {
    return new NextResponse("AI crawling and training on this site is not permitted.", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noai, noimageai, noindex" },
    });
  }
  return NextResponse.next();
}

export const config = {
  // everything except Next's own static build files (those are only useful after a page is served)
  // robots.txt, ai.txt and .well-known stay readable so crawlers can see the opt-out
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|ai.txt|\\.well-known).*)"],
};
