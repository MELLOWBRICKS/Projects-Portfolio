// Helper functions to fetch GitHub data with optional auth and concurrency limits

const GITHUB_API = "https://api.github.com"

function headers() {
  const token = process.env.GITHUB_TOKEN
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "v0-github-portfolio",
  }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

export async function ghGet<T>(path: string, init?: RequestInit): Promise<{ data: T; res: Response }> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers || {}) },
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    const err = new Error(`GitHub API error ${res.status}: ${text || res.statusText}`)
    // Attach response for upstream handling
    ;(err as any).response = res
    throw err
  }
  const data = (await res.json()) as T
  return { data, res }
}

// Simple concurrency-limited mapper
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length) as R[]
  let i = 0
  const workers = new Array(Math.min(limit, items.length)).fill(null).map(async () => {
    while (true) {
      const idx = i++
      if (idx >= items.length) return
      results[idx] = await mapper(items[idx], idx)
    }
  })
  await Promise.all(workers)
  return results
}

export type GitHubUser = {
  login: string
  avatar_url: string
  html_url: string
  name?: string
  bio?: string
  followers: number
  following: number
  public_repos: number
  company?: string
  blog?: string
  location?: string
}

export type GitHubRepo = {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  fork: boolean
  archived: boolean
  stargazers_count: number
  forks_count: number
  language: string | null
  default_branch: string
  pushed_at: string
  owner: { login: string }
}

export type RepoDetails = {
  readmePreview?: string
  lastCommitDate?: string
  commitCount?: number
  topics?: string[]
}

export async function fetchUser(username: string) {
  const { data } = await ghGet<GitHubUser>(`/users/${encodeURIComponent(username)}`)
  return data
}

export async function fetchUserRepos(username: string) {
  // Note: Only first 100 repos (most updated). For more, pagination can be added.
  const { data } = await ghGet<GitHubRepo[]>(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`)
  return data
}

export async function fetchRepoTopics(owner: string, repo: string) {
  try {
    const { data } = await ghGet<{ names: string[] }>(`/repos/${owner}/${repo}/topics`)
    return data.names || []
  } catch {
    return []
  }
}

export async function fetchRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  try {
    const { data } = await ghGet<Record<string, number>>(`/repos/${owner}/${repo}/languages`)
    return data || {}
  } catch {
    return {}
  }
}

export async function fetchRepoReadmeMarkdown(owner: string, repo: string): Promise<string | null> {
  const h = headers()
  // Prefer canonical /readme endpoint
  const readmeRes = await fetch(`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`, {
    headers: h,
    cache: "no-store",
  })

  if (readmeRes.ok) {
    const json: any = await readmeRes.json().catch(() => null)
    const content = json?.content
    const encoding = json?.encoding
    if (content) {
      try {
        return encoding === "base64" ? Buffer.from(content, "base64").toString("utf-8") : String(content)
      } catch {
        return String(content)
      }
    }
    return null
  }

  // Gracefully handle 403 (blocked) or 404 (no README) and other statuses
  if (readmeRes.status !== 404) {
    return null
  }

  // Fallback: scan repo root for README variants
  const listRes = await fetch(`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents`, {
    headers: h,
    cache: "no-store",
  })
  if (!listRes.ok) return null

  const items: any[] = await listRes.json().catch(() => [])
  const readmeItem = (Array.isArray(items) ? items : []).find(
    (it: any) => it?.type === "file" && /^readme(\.[^.]+)?$/i.test(it?.name || ""),
  )
  if (!readmeItem) return null

  const fileRes = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(
      readmeItem.path,
    )}`,
    { headers: h, cache: "no-store" },
  )
  if (!fileRes.ok) return null

  const fileJson: any = await fileRes.json().catch(() => null)
  const content2 = fileJson?.content
  const encoding2 = fileJson?.encoding
  if (content2) {
    try {
      return encoding2 === "base64" ? Buffer.from(content2, "base64").toString("utf-8") : String(content2)
    } catch {
      return String(content2)
    }
  }
  return null
}

export async function fetchRepoReadmePreview(owner: string, repo: string, lines = 3) {
  try {
    const readmeContent = await fetchRepoReadmeMarkdown(owner, repo)
    if (!readmeContent) return undefined

    // Take first non-empty lines (include headings), strip basic markdown, fallback if empty
    const clean = (s: string) =>
      s
        .replace(/.*?/gs, "")
        .replace(/\[(.*?)\]$$(.*?)$$/g, "$1")
        .replace(/[*_`>#]/g, "")
        .replace(/\s+/g, " ")
        .trim()

    const linesArr = readmeContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
    const preview = clean(linesArr.slice(0, lines).join(" "))

    if (preview) return preview
    const fallback = clean(readmeContent.slice(0, 200))
    return fallback || undefined
  } catch {
    return undefined
  }
}

export async function fetchRepoCommitInfo(owner: string, repo: string, branch: string) {
  try {
    const { data, res } = await ghGet<any[]>(
      `/repos/${owner}/${repo}/commits?per_page=1&sha=${encodeURIComponent(branch)}`,
    )
    const latest = data?.[0]
    const lastCommitDate: string | undefined = latest?.commit?.author?.date || latest?.commit?.committer?.date

    // Commit count via Link header last page
    const link = res.headers.get("Link")
    let commitCount: number | undefined
    if (link && link.includes('rel="last"')) {
      const match = link.match(/&page=(\d+)>;\s*rel="last"/)
      if (match) commitCount = Number(match[1])
    } else {
      // If only one page or repo empty
      commitCount = Array.isArray(data) ? data.length : undefined
    }
    return { lastCommitDate, commitCount }
  } catch {
    return { lastCommitDate: undefined, commitCount: undefined }
  }
}

export type CommitLite = {
  sha: string
  message: string
  authorName?: string
  authorEmail?: string
  date?: string
  html_url?: string
}

export async function fetchRepoCommits(owner: string, repo: string, perPage = 20): Promise<CommitLite[]> {
  const { data } = await ghGet<any[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=${perPage}`,
  )
  return (data || []).map((c) => ({
    sha: c?.sha,
    message: c?.commit?.message || "",
    authorName: c?.commit?.author?.name || c?.author?.login,
    authorEmail: c?.commit?.author?.email,
    date: c?.commit?.author?.date || c?.commit?.committer?.date,
    html_url: c?.html_url,
  }))
}

export function getUsername() {
  // Fixed per user request
  return "MELLOWBRICKS"
}

export async function githubFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { data } = await ghGet<T>(path, init)
  return data
}
