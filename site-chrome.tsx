'use client'

import { Wrench } from 'lucide-react'

export type PageId = 'home' | 'about' | 'privacy' | 'terms' | 'contact'

export function SiteHeader({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-primary"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="size-4" />
          </span>
          PDF Toolkit Pro
        </button>
        <span className="hidden text-xs font-medium text-muted-foreground sm:block">
          100% in-browser &middot; No uploads to a server
        </span>
      </div>
    </header>
  )
}

export function SiteFooter({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const links: { id: PageId; label: string }[] = [
    { id: 'about', label: 'About' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms' },
    { id: 'contact', label: 'Contact' },
  ]
  return (
    <footer className="mt-auto bg-foreground px-4 py-10 text-center text-background">
      <p className="text-base font-bold">PDF Toolkit Pro</p>
      <p className="mt-1 text-xs text-background/60">
        Copyright &copy; 2026 PDF Toolkit Pro. All rights reserved.
      </p>
      <nav className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className="text-sm font-medium text-background/70 transition-colors hover:text-background"
          >
            {link.label}
          </button>
        ))}
      </nav>
    </footer>
  )
}
