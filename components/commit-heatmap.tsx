"use client"

type Week = { total: number; week: number; days: number[] }
export function CommitHeatmap({ weeks }: { weeks: Week[] }) {
  const recent = weeks.slice(-12)
  const values = recent.flatMap((w) => w.days)
  const max = Math.max(1, ...values)

  const level = (v: number) => {
    if (v === 0) return "bg-[color:var(--heat-0)]"
    const n = Math.ceil((v / max) * 4)
    return [
      "bg-[color:var(--heat-1)]",
      "bg-[color:var(--heat-1)]",
      "bg-[color:var(--heat-2)]",
      "bg-[color:var(--heat-3)]",
      "bg-[color:var(--heat-4)]",
    ][n]
  }

  return (
    <div className="grid grid-cols-12 gap-1" aria-label="Recent commit activity">
      {recent.map((w, wi) => (
        <div key={wi} className="grid grid-rows-7 gap-1">
          {w.days.map((d, di) => (
            <div key={di} className={`h-2 w-2 rounded-sm ${level(d)}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
