"use client"

import { useMemo } from "react"
import useSWR from "swr"

type ContributionDay = {
  date: string
  contributionCount: number
}

type ContributionWeek = {
  contributionDays: ContributionDay[]
}

type ContributionsData = {
  totalContributions: number
  weeks: ContributionWeek[]
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function GitHubContributions({ username }: { username: string }) {
  const { data, isLoading, error } = useSWR<ContributionsData>(
    `/api/github/${username}/contributions`,
    fetcher
  )

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
          <div className="ml-auto h-3 bg-muted rounded w-24 animate-pulse"></div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 53 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="w-2.5 h-2.5 bg-muted/50 rounded-sm animate-pulse"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">GitHub Activity</h3>
          <div className="text-xs text-muted-foreground">
            {error ? "Unable to load contributions" : "No data available"}
          </div>
        </div>
        {!data?.totalContributions && data?.message?.includes('token') && (
          <div className="text-xs text-yellow-600 mb-2 p-2 bg-yellow-50 rounded">
            ⚠️ GitHub token missing. Add GITHUB_TOKEN to Vercel environment variables.
          </div>
        )}
        <div className="flex gap-1">
          {Array.from({ length: 53 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="w-2.5 h-2.5 bg-muted/30 rounded-sm"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const total = data.totalContributions || 0
  const weeks = data.weeks ? data.weeks.slice(-52) : []

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">GitHub Activity</h3>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{total} contributions this year</span>
        </div>
      </div>
      
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1 shrink-0">
            {(week.contributionDays || []).map((day, dayIndex) => {
              const count = day.contributionCount || 0
              const level = count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4
              const colors = [
                'bg-muted/30',
                'bg-[var(--heat-1)]',
                'bg-[var(--heat-2)]', 
                'bg-[var(--heat-3)]',
                'bg-[var(--heat-4)]'
              ]
              
              return (
                <div
                  key={dayIndex}
                  className={`w-2.5 h-2.5 rounded-sm ${colors[level]} transition-colors`}
                  title={`${count} contributions on ${day.date}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-2.5 h-2.5 rounded-sm ${
                level === 0 ? 'bg-muted/30' :
                level === 1 ? 'bg-[var(--heat-1)]' :
                level === 2 ? 'bg-[var(--heat-2)]' :
                level === 3 ? 'bg-[var(--heat-3)]' :
                'bg-[var(--heat-4)]'
              }`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
