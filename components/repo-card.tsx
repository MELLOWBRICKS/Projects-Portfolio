"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Calendar, GitFork, Star, ExternalLink } from "lucide-react"
import { LANGUAGE_COLORS } from "@/lib/language-colors"
import { cn } from "@/lib/utils"

type Repo = {
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

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json())

export default function RepoCard({ repo }: { repo: Repo }) {
  const router = useRouter()
  const lang = repo.language || "Other"
  const color = LANGUAGE_COLORS[lang] || "#6b7280"

  const lastCommit = repo.details?.lastCommitDate
    ? new Date(repo.details.lastCommitDate).toLocaleDateString()
    : new Date(repo.pushed_at).toLocaleDateString()

  // README markdown preview (rendered)
  const { data: readme } = useSWR<{ markdown: string }>(
    `/api/github/repos/${encodeURIComponent(repo.name)}/readme`,
    fetcher,
  )

  function openDetails() {
    router.push(`/${encodeURIComponent(repo.name)}`)
  }

  return (
    <article
      className={cn(
        "group relative flex h-72 w-full cursor-pointer flex-col rounded-lg border border-border bg-card p-4 transition-transform hover:-translate-y-0.5 hover:shadow-md overflow-hidden",
      )}
      onClick={openDetails}
      role="button"
      tabIndex={0}
      aria-label={`Open ${repo.name} details`}
    >
      <header className="mb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
              aria-label={`Language color for ${lang}`}
            />
            <h3 className="text-pretty text-lg font-semibold">{repo.name}</h3>
          </div>
          <Link
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-[#3DB05A] px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-[#3DB05A] focus:ring-offset-1"
            onClick={(e) => e.stopPropagation()}
            aria-label="Open on GitHub"
          >
            <ExternalLink className="h-3 w-3" />
            GitHub
          </Link>
        </div>
        {repo.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground text-pretty">{repo.description}</p>
        ) : null}
      </header>

      {/* README markdown preview with bottom fade */}
      <div className="relative mb-3 flex-1 overflow-hidden rounded-md border border-border bg-background p-2">
        <div className="prose prose-invert readme-prose max-w-none text-xs leading-relaxed overflow-hidden break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {readme?.markdown
              ? readme.markdown.split("\n").slice(0, 20).join("\n")
              : repo.details?.readmePreview || "_No README preview available._"}
          </ReactMarkdown>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Footer: stats */}
      <footer className="mt-auto flex items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1" aria-label="Stars">
            <Star className="h-4 w-4" />
            <span>{repo.stargazers_count}</span>
          </div>
          <div className="flex items-center gap-1" aria-label="Forks">
            <GitFork className="h-4 w-4" />
            <span>{repo.forks_count}</span>
          </div>
          <div className="flex items-center gap-1" aria-label="Last commit date">
            <Calendar className="h-4 w-4" />
            <span>{lastCommit}</span>
          </div>
        </div>
        <div className="ml-auto">
          <div className="h-2 w-24" />
        </div>
      </footer>
    </article>
  )
}
