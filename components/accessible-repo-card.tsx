'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, GitFork, Star, ExternalLink } from "lucide-react"
import { LANGUAGE_COLORS } from "@/lib/language-colors"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"

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
  details?: {
    readmePreview?: string
    lastCommitDate?: string
    commitCount?: number
    topics?: string[]
  }
}

export default function AccessibleRepoCard({ repo }: { repo: Repo }) {
  const router = useRouter()
  const [isFocused, setIsFocused] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  
  const lang = repo.language || "Other"
  const color = LANGUAGE_COLORS[lang] || "#6b7280"
  
  const lastCommit = repo.details?.lastCommitDate
    ? new Date(repo.details.lastCommitDate).toLocaleDateString()
    : new Date(repo.pushed_at).toLocaleDateString()

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/${encodeURIComponent(repo.name)}`)
    }
  }

  function openDetails() {
    router.push(`/${encodeURIComponent(repo.name)}`)
  }

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative flex h-72 w-full cursor-pointer flex-col rounded-lg border border-border bg-card p-4 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-[#3DB05A]/50",
        "focus-within:ring-2 focus-within:ring-[#3DB05A] focus-within:ring-offset-2",
        isFocused && "ring-2 ring-[#3DB05A] ring-offset-2"
      )}
      onClick={openDetails}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="button"
      tabIndex={0}
      aria-label={`Repository ${repo.name}. ${repo.description || 'No description'}. ${repo.stargazers_count} stars, ${repo.forks_count} forks. Press Enter to view details.`}
    >
      <header className="mb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
              aria-label={`Programming language: ${lang}`}
            />
            <h3 className="text-pretty text-lg font-semibold">{repo.name}</h3>
            {repo.archived && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full" aria-label="Archived repository">
                Archived
              </span>
            )}
            {repo.fork && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full" aria-label="Forked repository">
                Fork
              </span>
            )}
          </div>
          <Link
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-[#3DB05A] px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-[#3DB05A] focus:ring-offset-1"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Open ${repo.name} on GitHub in new tab`}
          >
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            GitHub
          </Link>
        </div>
        {repo.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground text-pretty">
            {repo.description}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground italic">No description available</p>
        )}
      </header>

      {/* Topics */}
      {repo.details?.topics && repo.details.topics.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1" role="list" aria-label="Repository topics">
          {repo.details.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full"
              role="listitem"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* README preview */}
      <div className="relative mb-3 flex-1 overflow-hidden rounded-md border border-border bg-background p-2">
        <div className="prose prose-invert readme-prose max-w-none text-xs leading-relaxed">
          {repo.details?.readmePreview || "_No README preview available._"}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Footer: stats */}
      <footer className="mt-auto flex items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground" role="list" aria-label="Repository statistics">
          <div className="flex items-center gap-1" role="listitem" aria-label={`${repo.stargazers_count} stars`}>
            <Star className="h-4 w-4" aria-hidden="true" />
            <span>{repo.stargazers_count}</span>
          </div>
          <div className="flex items-center gap-1" role="listitem" aria-label={`${repo.forks_count} forks`}>
            <GitFork className="h-4 w-4" aria-hidden="true" />
            <span>{repo.forks_count}</span>
          </div>
          <div className="flex items-center gap-1" role="listitem" aria-label={`Last updated ${lastCommit}`}>
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>{lastCommit}</span>
          </div>
        </div>
      </footer>
    </article>
  )
}
