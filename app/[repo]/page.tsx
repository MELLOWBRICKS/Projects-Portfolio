import { githubFetch, getUsername, fetchRepoReadmeMarkdown, fetchRepoLanguages } from "@/lib/github"
import { LANGUAGE_COLORS } from "@/lib/language-colors"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default async function RepoDetailPage({ params }: { params: Promise<{ repo: string }> }) {
  const username = getUsername()
  const { repo: repoName } = await params
  const [repo, contents, markdown, languages] = await Promise.all([
    githubFetch<any>(`/repos/${username}/${repoName}`),
    githubFetch<any[]>(`/repos/${username}/${repoName}/contents`).catch(() => []),
    fetchRepoReadmeMarkdown(username, repoName).catch(() => null),
    fetchRepoLanguages(username, repoName).catch(() => ({})),
  ])

  const totalBytes = Object.values(languages).reduce((sum: number, bytes: number) => sum + bytes, 0)
  const languagePercentages = Object.entries(languages)
    .map(([lang, bytes]) => ({
      name: lang,
      percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      color: LANGUAGE_COLORS[lang] || "#6b7280"
    }))
    .sort((a, b) => b.percentage - a.percentage)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-semibold text-[#4A90E2]">{repo.name}</h1>
              <span className="px-2 py-1 text-xs border border-border rounded-full text-muted-foreground">
                {repo.private ? 'Private' : 'Public'}
              </span>
            </div>
            {repo.description && (
              <p className="text-muted-foreground mb-3">{repo.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {languagePercentages.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3">
                  {languagePercentages.map((lang) => (
                    <span key={lang.name} className="flex items-center gap-1">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: lang.color }}
                      ></span>
                      {lang.name} {lang.percentage}%
                    </span>
                  ))}
                </div>
              ) : repo.language && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  {repo.language}
                </span>
              )}
              <span className="flex items-center gap-1">⭐ {repo.stargazers_count}</span>
              <span className="flex items-center gap-1">🍴 {repo.forks_count}</span>
              <span>Updated {new Date(repo.updated_at || repo.pushed_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={repo.html_url}
              className="inline-flex items-center gap-2 rounded-md bg-[#3DB05A] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#2ea043]"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Files Section */}
        <div className="rounded-md border border-border">
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{contents.length} files</span>
            </div>
          </div>
          <div className="divide-y divide-border">
            {Array.isArray(contents) && contents.length > 0 ? (
              contents.map((item: any) => (
                <div key={item.path} className="px-4 py-2 hover:bg-muted/50 flex items-center gap-3">
                  <span className="text-lg">
                    {item.type === "dir" ? "📁" : "📄"}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {item.size ? `${Math.round(item.size / 1024)}KB` : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                This repository is empty
              </div>
            )}
          </div>
        </div>

        {/* README Section */}
        <div className="rounded-md border border-border">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="font-medium flex items-center gap-2">
              📄 README.md
            </h2>
          </div>
          <div className="p-6">
            <article className="prose prose-invert readme-prose max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-l-border prose-hr:border-border">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown || "_No README available._"}</ReactMarkdown>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
