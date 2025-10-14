'use client'

import { useState } from 'react'
import { Menu, X, Github, Download } from 'lucide-react'
import Link from 'next/link'

interface MobileNavProps {
  user?: {
    login: string
    html_url: string
    followers: number
    following: number
  }
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-muted"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border-b border-border p-4 space-y-4 z-50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{user?.followers || 0} followers</span>
            <span>{user?.following || 0} following</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <Link
              href={user?.html_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </Link>
            
            <a
              href="https://www.mellowbricks.co.in/Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#3DB05A] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2ea043]"
            >
              <Download className="h-4 w-4" />
              Download Resume
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
