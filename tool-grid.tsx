'use client'

import { TOOLS, type Tool } from '@/lib/toolkit/tools-config'

function ToolCard({ tool, onSelect }: { tool: Tool; onSelect: (tool: Tool) => void }) {
  const Icon = tool.icon
  return (
    <button
      onClick={() => onSelect(tool)}
      className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-card-foreground group-hover:text-primary">
          {tool.label}
        </span>
        {!tool.supported && (
          <span className="text-[11px] font-medium text-muted-foreground">
            Needs a server
          </span>
        )}
      </span>
    </button>
  )
}

export function ToolGrid({ onSelect }: { onSelect: (tool: Tool) => void }) {
  const pdfTools = TOOLS.filter((t) => t.category === 'pdf')
  const imageTools = TOOLS.filter((t) => t.category === 'image')

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-4 border-b border-border pb-2 text-lg font-bold text-foreground">
          PDF Tools
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {pdfTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelect} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 border-b border-border pb-2 text-lg font-bold text-foreground">
          Image Tools
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {imageTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelect} />
          ))}
        </div>
      </section>
    </div>
  )
}
