import { NextResponse } from "next/server"

export const revalidate = 1800 // cache for 30 minutes

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params
    
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      return NextResponse.json({ message: 'GitHub token required' }, { status: 500 })
    }

    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username }
      }),
      cache: 'no-store'
    })

    const data = await response.json()
    
    if (data.errors || !data.data?.user) {
      return NextResponse.json({ message: 'Failed to fetch contributions' }, { status: 500 })
    }

    const calendar = data.data.user.contributionsCollection.contributionCalendar
    
    return NextResponse.json({
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks
    })

  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch contributions' }, { status: 500 })
  }
}
