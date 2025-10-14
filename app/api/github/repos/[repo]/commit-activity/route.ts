import { NextResponse } from "next/server"
import { getUsername } from "@/lib/github"

export async function GET(_: Request, { params }: { params: Promise<{ repo: string }> }) {
  const username = getUsername()
  const { repo } = await params
  try {
    const path = `/repos/${username}/${repo}/stats/commit_activity`
    let attempts = 0
    let data: any = null
    while (attempts < 3) {
      const res = await fetch(`https://api.github.com${path}`, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: process.env.GITHUB_TOKEN ? `Bearer ${process.env.GITHUB_TOKEN}` : "",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      })
      if (res.status === 202) {
        await new Promise((r) => setTimeout(r, 800))
        attempts++
        continue
      }
      if (!res.ok) {
        return NextResponse.json({ weeks: [] })
      }
      data = await res.json()
      break
    }
    if (!Array.isArray(data)) return NextResponse.json({ weeks: [] })
    return NextResponse.json({ weeks: data })
  } catch {
    return NextResponse.json({ weeks: [] })
  }
}
