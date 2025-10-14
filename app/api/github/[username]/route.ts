// Route Handler to aggregate GitHub profile and repositories with details
import { NextResponse } from "next/server"
import {
  fetchUser,
  fetchUserRepos,
  fetchRepoCommitInfo,
  fetchRepoReadmePreview,
  fetchRepoTopics,
  fetchRepoLanguages,
  mapWithConcurrency,
  type GitHubRepo,
} from "@/lib/github"
import { getCache, setCache } from "@/lib/cache"

export const revalidate = 300

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { searchParams } = new URL(req.url)
  const includeDetails = searchParams.get("includeDetails") !== "false"
  const limitParam = searchParams.get("limit")
  const limit = 10 // Fixed to 10 repos for speed

  try {
    const { username } = await params
    const cacheKey = `user-repos-${username}`
    
    // Try cache first
    const cached = getCache<any>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, { status: 200 })
    }
    
    const [user, reposRaw] = await Promise.all([fetchUser(username), fetchUserRepos(username)])

    const repos = (limit ? reposRaw.slice(0, limit) : reposRaw).sort((a, b) => {
      // Sort by creation date, newest first (GitHub API provides created_at)
      const dateA = new Date(a.created_at || a.pushed_at).getTime()
      const dateB = new Date(b.created_at || b.pushed_at).getTime()
      return dateB - dateA
    })

    let detailed: Array<
      GitHubRepo & {
        details: {
          readmePreview?: string
          lastCommitDate?: string
          commitCount?: number
          topics?: string[]
        }
      }
    > = []

    if (includeDetails) {
      detailed = await mapWithConcurrency(repos, 3, async (repo) => {
        const owner = repo.owner.login
        const name = repo.name

        const [commitInfo, readmePreview, topics, languages] = await Promise.all([
          fetchRepoCommitInfo(owner, name, repo.default_branch),
          fetchRepoReadmePreview(owner, name, 3),
          fetchRepoTopics(owner, name).catch(() => [] as string[]),
          fetchRepoLanguages(owner, name).catch(() => ({} as Record<string, number>)),
        ])

        return {
          ...repo,
          details: {
            readmePreview,
            lastCommitDate: commitInfo.lastCommitDate,
            commitCount: commitInfo.commitCount,
            topics,
            languages,
          },
        }
      })
    } else {
      detailed = repos.map((r) => ({ ...r, details: {} }))
    }

    const featured = detailed.filter((r) => !r.fork && !r.archived && (r.description?.includes('[PROJECT]') || r.description?.includes('[project]')))
    const other = detailed.filter((r) => r.fork || r.archived || (!r.description?.includes('[PROJECT]') && !r.description?.includes('[project]')))

    const result = {
      user,
      repos: {
        featured,
        other,
      },
    }
    
    // Cache the result
    setCache(cacheKey, result)
    
    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    // Rate limit awareness
    const res: Response | undefined = err?.response
    const remaining = res?.headers?.get?.("x-ratelimit-remaining")
    const reset = res?.headers?.get?.("x-ratelimit-reset")
    const payload: Record<string, unknown> = { message: err?.message || "Failed to fetch GitHub data." }
    if (remaining === "0") {
      payload.rateLimited = true
      if (reset) payload.resetAt = Number(reset)
    }
    const status = res?.status || 500
    return NextResponse.json(payload, { status })
  }
}
