import { NextResponse } from "next/server"

export const revalidate = 1800 // cache for 30 minutes

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params
    
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      console.error('GitHub token not found in environment variables')
      return NextResponse.json({ 
        message: 'GitHub token required. Please add GITHUB_TOKEN to environment variables.',
        totalContributions: 0,
        weeks: []
      }, { status: 200 }) // Return 200 with empty data instead of error
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
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      return NextResponse.json({ 
        message: 'GraphQL error',
        totalContributions: 0,
        weeks: []
      }, { status: 200 })
    }
    
    if (!data.data?.user) {
      console.error('User not found:', username)
      return NextResponse.json({ 
        message: 'User not found',
        totalContributions: 0,
        weeks: []
      }, { status: 200 })
    }

    const calendar = data.data.user.contributionsCollection.contributionCalendar
    
    return NextResponse.json({
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks
    })

  } catch (error: any) {
    console.error('Contributions API error:', error)
    return NextResponse.json({ 
      message: 'Failed to fetch contributions',
      totalContributions: 0,
      weeks: []
    }, { status: 200 })
  }
}
