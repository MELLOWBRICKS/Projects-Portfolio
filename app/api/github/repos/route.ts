import { NextResponse } from "next/server"
import { githubFetch, getUsername } from "@/lib/github"

export async function GET() {
  const username = getUsername()
  // Get both owned and contributed (for "All") but client will filter tabs
  // We fetch user repos and sort by updated desc
  const repos = await githubFetch<any[]>(`/users/${username}/repos?per_page=100&sort=updated`)
  // Normalize fields we'll use
  const normalized = repos.map((r) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    description: r.description,
    language: r.language,
    topics: r.topics || [],
    stargazers_count: r.stargazers_count,
    forks_count: r.forks_count,
    pushed_at: r.pushed_at,
    fork: r.fork,
    archived: r.archived,
    html_url: r.html_url,
    clone_url: r.clone_url,
    ssh_url: r.ssh_url,
    owner_login: r.owner?.login,
  }))
  return NextResponse.json({ repos: normalized })
}
