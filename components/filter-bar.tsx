"use client"

import { cn } from "@/lib/utils"

type Props = {
  search: string
  onSearch: (v: string) => void
  language: string
  onLanguage: (v: string) => void
  languages: string[]
}

export default function FilterBar({ search, onSearch, language, onLanguage, languages }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center md:justify-between",
      )}
    >
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M21 21l-4.3-4.3M17 10.5a6.5 6.5 0 11-13.001.001A6.5 6.5 0 0117 10.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search repositories by name"
          className="w-full rounded-md border border-border bg-background px-8 py-2 text-sm outline-none ring-0 focus:border-accent"
          aria-label="Search repositories"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={language}
          onChange={(e) => onLanguage(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-2 text-sm"
          aria-label="Filter by language"
        >
          <option value="">All languages</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
