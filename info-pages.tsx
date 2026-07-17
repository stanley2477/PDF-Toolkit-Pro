'use client'

import type { PageId } from './site-chrome'

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 leading-relaxed text-card-foreground sm:p-8">
      {children}
    </div>
  )
}

export function InfoPage({ page }: { page: Exclude<PageId, 'home'> }) {
  if (page === 'about') {
    return (
      <section>
        <h1 className="mb-6 text-3xl font-extrabold text-foreground">About PDF Toolkit Pro</h1>
        <Card>
          <p className="mb-4">
            Welcome to <strong>PDF Toolkit Pro</strong>, your destination for rapid,
            web-accessible file conversions. Managing documents shouldn&apos;t require
            installing expensive corporate software or fighting through confusing
            configuration options.
          </p>
          <p>
            We built this platform to democratize productivity tools. Every conversion,
            compression, and edit runs directly inside your browser using the Canvas and
            WebAssembly capabilities of modern devices &mdash; so your files never leave
            your computer.
          </p>
        </Card>
      </section>
    )
  }

  if (page === 'privacy') {
    return (
      <section>
        <h1 className="mb-6 text-3xl font-extrabold text-foreground">Privacy Policy</h1>
        <Card>
          <p>
            <strong>Data Preservation:</strong> Files you open are handled entirely inside
            your browser&apos;s memory. We do not upload, extract, review, sell, or archive
            your files or their contents. Everything is processed safely right on your
            device, and results are discarded as soon as you close the tab.
          </p>
        </Card>
      </section>
    )
  }

  if (page === 'terms') {
    return (
      <section>
        <h1 className="mb-6 text-3xl font-extrabold text-foreground">Terms of Service</h1>
        <Card>
          <p>
            By using our online utilities, you agree to comply with our acceptable web
            usage rules. Tools are provided &quot;as is&quot; for personal and
            professional productivity. You are responsible for retaining backups of any
            files you process.
          </p>
        </Card>
      </section>
    )
  }

  return (
    <section>
      <h1 className="mb-6 text-center text-3xl font-extrabold text-foreground">Contact Us</h1>
      <Card>
        <div className="text-center">
          <p className="mb-4">
            Have a question, feedback, or a custom tool recommendation? Reach out directly
            via email.
          </p>
          <div className="rounded-xl border border-primary/20 bg-accent p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Direct Support Email
            </p>
            <a
              href="mailto:tookkitpropdf@gmail.com"
              className="text-lg font-bold text-primary underline underline-offset-4"
            >
              tookkitpropdf@gmail.com
            </a>
          </div>
        </div>
      </Card>
    </section>
  )
}
