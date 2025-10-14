import { NextResponse } from "next/server"
import { getUsername, fetchRepoReadmeMarkdown } from "@/lib/github"
import { getCache, setCache } from "@/lib/cache"

export const revalidate = 1800

export async function GET(_: Request, { params }: { params: Promise<{ repo: string }> }) {
  const username = getUsername()
  const { repo } = await params
  const cacheKey = `readme-${username}-${repo}`
  
  // Try cache first
  const cached = getCache<string>(cacheKey)
  if (cached !== null) {
    return NextResponse.json({ markdown: cached })
  }
  
  // Fetch and cache
  const md = await fetchRepoReadmeMarkdown(username, repo)
  setCache(cacheKey, md || "")
  
  return NextResponse.json({ markdown: md || "" })
}
