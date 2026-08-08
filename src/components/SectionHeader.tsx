import type { ReactNode } from 'react'

interface SectionHeaderProps {
  eyebrow: string
  title: ReactNode
  description?: string
  light?: boolean
  align?: 'center' | 'left'
}

/** Section header — style éditorial noble : eyebrow espacé, titre Playfair, ornement. */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  light = false,
  align = 'center',
}: SectionHeaderProps) {
  return (
    <div
      className={[
        'mb-14 max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
      ].join(' ')}
    >
      <span className="font-accent text-[11px] font-semibold uppercase tracking-noblesse text-accent-dark">
        {eyebrow}
      </span>
      <h2
        className={[
          'mt-4 font-heading text-4xl font-bold leading-tight md:text-5xl',
          light ? 'text-cream' : 'text-primary',
        ].join(' ')}
      >
        {title}
      </h2>

      {/* Ornement central : ligne — losange — ligne */}
      <div
        className={[
          'ornament',
          align === 'center' ? 'flex' : 'hidden',
        ].join(' ')}
      >
        <span className="text-accent text-sm">◆</span>
      </div>

      {description && (
        <p
          className={[
            'mt-5 text-base leading-relaxed',
            light ? 'text-cream/70' : 'text-muted',
          ].join(' ')}
        >
          {description}
        </p>
      )}
    </div>
  )
}
