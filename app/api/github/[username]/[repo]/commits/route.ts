import { NextResponse } from "next/server"
import { fetchRepoCommits } from "@/lib/github"

export const revalidate = 600

export async function GET(req: Request, { params }: { params: { username: string; repo: string } }) {
  try {
    const commits = await fetchRepoCommits(params.username, params.repo, 20)
    return NextResponse.json({ commits }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Failed to fetch commits" }, { status: 500 })
  }
}
