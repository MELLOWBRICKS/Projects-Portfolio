// Optimized GitHub API functions
import { ghGet, mapWithConcurrency } from './github'

export async function fetchReposWithReadme(username: string, limit = 10) {
  const repos = await fetchUserRepos(username)
  const limitedRepos = repos.slice(0, limit)
  
  // Batch fetch README content for all repos
  const reposWithReadme = await mapWithConcurrency(limitedRepos, 3, async (repo) => {
    const [commitInfo, readmePreview, topics, readmeMarkdown] = await Promise.all([
      fetchRepoCommitInfo(repo.owner.login, repo.name, repo.default_branch),
      fetchRepoReadmePreview(repo.owner.login, repo.name, 3),
      fetchRepoTopics(repo.owner.login, repo.name).catch(() => []),
      fetchRepoReadmeMarkdown(repo.owner.login, repo.name).catch(() => null)
    ])

    return {
      ...repo,
      details: {
        readmePreview,
        readmeMarkdown, // Include full markdown
        lastCommitDate: commitInfo.lastCommitDate,
        commitCount: commitInfo.commitCount,
        topics,
      },
    }
  })
  
  return reposWithReadme
}
