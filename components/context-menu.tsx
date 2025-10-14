"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

type Item = { label: string; onClick: () => void }
export function useContextMenu() {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const timerRef = useRef<number | null>(null)

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setPos({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    timerRef.current = window.setTimeout(() => {
      const touch = e.touches[0]
      setPos({ x: touch.clientX, y: touch.clientY })
      setOpen(true)
    }, 500)
  }
  const onTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener("click", close)
    window.addEventListener("scroll", close)
    return () => {
      window.removeEventListener("click", close)
      window.removeEventListener("scroll", close)
    }
  }, [])

  return { open, pos, setOpen, onContextMenu, onTouchStart, onTouchEnd }
}

export function ContextMenu({
  open,
  pos,
  items,
}: {
  open: boolean
  pos: { x: number; y: number }
  items: Item[]
}) {
  if (!open) return null
  return (
    <div
      className="fixed z-50 min-w-48 rounded-md border border-[color:var(--muted)] bg-card shadow-lg"
      style={{ left: pos.x, top: pos.y }}
      role="menu"
      aria-label="Repository actions"
    >
      <ul className="p-1">
        {items.map((it, i) => (
          <li key={i}>
            <button
              className="w-full cursor-pointer rounded px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
              onClick={it.onClick}
              role="menuitem"
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
