"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import RepoCard from "./repo-card"
import FilterBar from "./filter-bar"
import { GitHubContributions } from "./github-contributions"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

type ApiRepo = {
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
  clone_url?: string
  ssh_url?: string
  details?: {
    readmePreview?: string
    lastCommitDate?: string
    commitCount?: number
    topics?: string[]
  }
}

type ApiResponse = {
  user: {
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
  repos: {
    featured: ApiRepo[]
    other: ApiRepo[]
  }
}

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    const j = await r.json()
    if (!r.ok) throw new Error(j?.message || "Failed to fetch")
    return j
  })

export default function GithubPortfolio() {
  const username = "MELLOWBRICKS"
  const [search, setSearch] = useState("")
  const [language, setLanguage] = useState("")
  const [tab, setTab] = useState<"my" | "all">("my")

  const { data, error, isLoading } = useSWR<ApiResponse>(
    `/api/github/${encodeURIComponent(username)}?includeDetails=true`,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  const myRepos = useMemo(() => data?.repos.featured ?? [], [data])
  const allRepos = useMemo(() => {
    if (!data) return []
    const combined = [...(data.repos.featured || []), ...(data.repos.other || [])]
    // Sort by creation date, newest first (use pushed_at as fallback)
    return combined.sort((a, b) => {
      const dateA = new Date(a.pushed_at).getTime()
      const dateB = new Date(b.pushed_at).getTime()
      return dateB - dateA
    })
  }, [data])

  const languages = useMemo(() => {
    const set = new Set<string>()
    allRepos.forEach((r) => r.language && set.add(r.language))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [allRepos])

  function filterRepos(repos: ApiRepo[]) {
    const q = search.trim().toLowerCase()
    return repos.filter((r) => {
      const nameMatch = !q || r.name.toLowerCase().includes(q)
      const langMatch = !language || (r.language || "") === language
      return nameMatch && langMatch
    })
  }

  const currentList = useMemo(() => {
    const base = tab === "my" ? myRepos : allRepos
    return filterRepos(base)
  }, [tab, myRepos, allRepos, search, language])

  return (
    <div className="block md:h-[100dvh] md:flex md:flex-col">
      <div
        className="mx-auto w-full max-w-6xl px-4 py-4 flex flex-col gap-4"
        style={
          {
            "--accent": "#4A90E2",
            "--accent-foreground": "oklch(0.98 0.01 170)",
            "--heat-1": "#1e3a5f",
            "--heat-2": "#2d5aa0",
            "--heat-3": "#4A90E2",
            "--heat-4": "#6bb6ff",
          } as any
        }
      >
        {/* Header */}
        <section className={cn("rounded-xl border border-border bg-card p-4", "relative overflow-hidden")}>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="overflow-hidden rounded-full border border-border">
                <Image
                  src={data?.user?.avatar_url || "/placeholder.svg?height=96&width=96&query=avatar%20placeholder"}
                  alt="GitHub avatar"
                  width={72}
                  height={72}
                />
              </div>
              <div>
                <h1 className="text-balance text-2xl font-semibold">{data?.user?.name || username}</h1>
                <p className="text-sm text-muted-foreground">
                  <Link
                    href={data?.user?.html_url || `https://github.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted underline-offset-4"
                  >
                    @{data?.user?.login || username}
                  </Link>
                </p>
                {data?.user?.bio ? (
                  <p className="mt-1 max-w-prose text-sm text-pretty text-muted-foreground">{data.user.bio}</p>
                ) : null}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {data?.user?.location && <span>📍 {data.user.location}</span>}
                  {data?.user?.company && <span>🏢 {data.user.company}</span>}
                </div>
              </div>
            </div>

            <div className="w-full max-w-sm md:w-auto flex items-center justify-start md:justify-end gap-4">
              <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
                <span>{data?.user?.followers || 0} followers</span>
                <span>•</span>
                <span>{data?.user?.following || 0} following</span>
              </div>
              <a
                href="https://www.mellowbricks.co.in/Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-[#4A90E2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#357ABD] focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:ring-offset-2"
              >
                Download Resume
              </a>
            </div>
          </div>
        </section>

        {/* GitHub Contributions */}
        <section>
          <GitHubContributions username={username} />
        </section>

        {/* Filters + Tabs */}
        <section className="flex flex-col gap-3">
          <FilterBar
            search={search}
            onSearch={setSearch}
            language={language}
            onLanguage={setLanguage}
            languages={languages}
          />

          <div className="flex items-center gap-2">
            <button
              className={cn(
                "rounded-md border px-3 py-1 text-sm transition-colors",
                tab === "my"
                  ? "border-[#4A90E2] bg-[#4A90E2] text-white"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
              onClick={() => setTab("my")}
            >
              My Projects
            </button>
            <button
              className={cn(
                "rounded-md border px-3 py-1 text-sm transition-colors",
                tab === "all"
                  ? "border-[#4A90E2] bg-[#4A90E2] text-white"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
              onClick={() => setTab("all")}
            >
              All Repositories
            </button>
          </div>
        </section>
      </div>

      {/* Content: Scrollable cards area */}
      <div className="md:flex-1 md:overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 pb-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-lg border border-border bg-card" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-destructive">
              {error.message || "Failed to load data."}
            </div>
          ) : currentList.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentList.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
              No repositories match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
