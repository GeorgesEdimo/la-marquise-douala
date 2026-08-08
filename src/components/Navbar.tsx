import { useState } from 'react'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { useBooking } from '@/hooks/useBooking'
import { useCart } from '@/hooks/useCart'

const LINKS = [
  { href: '#about', label: 'Notre Histoire', id: 'about' },
  { href: '#menu', label: 'La Carte', id: 'menu' },
  { href: '#gallery', label: 'Galerie', id: 'gallery' },
  { href: '#hours', label: 'Horaires', id: 'hours' },
  { href: '#contact', label: 'Contact', id: 'contact' },
]

const SECTION_IDS = LINKS.map((l) => l.id)

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { scrolled, activeId } = useScrollSpy(SECTION_IDS)
  const { openReservation, openEvent, openOrder } = useBooking()
  const { count } = useCart()

  const close = () => setOpen(false)

  return (
    <nav
      className={[
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out-quart',
        scrolled || open
          ? 'border-b border-accent/15 bg-primary-dark/95 py-3 backdrop-blur-md'
          : 'bg-transparent py-5',
      ].join(' ')}
    >
      <div className="container-yard flex items-center justify-between">
        <a href="#hero" aria-label="La Marquise — Accueil" className="group flex items-center gap-3">
          {/* Monogramme minimal dans la navbar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40">
            <span className="font-heading text-sm font-bold text-accent">LM</span>
          </div>
          <span className="hidden font-heading text-xl font-bold text-cream md:inline">La Marquise</span>
        </a>

        {/* Desktop links — style noble, underline hover */}
        <ul className="hidden items-center gap-10 lg:flex">
          {LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                className={[
                  'group relative font-accent text-[11px] font-semibold uppercase tracking-luxe text-cream/70 transition-colors duration-300 hover:text-accent',
                  activeId === link.id ? 'text-accent' : '',
                ].join(' ')}
              >
                {link.label}
                <span
                  className={[
                    'absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300 ease-out-quart',
                    activeId === link.id ? 'w-full' : 'w-0 group-hover:w-full',
                  ].join(' ')}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 lg:flex">
          <button
            type="button"
            onClick={openOrder}
            className="relative font-accent text-[11px] font-semibold uppercase tracking-luxe text-cream/70 transition-colors hover:text-accent"
          >
            Commander
            {count > 0 && (
              <span className="absolute -right-4 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-primary-dark">
                {count}
              </span>
            )}
          </button>

          <button type="button" onClick={openEvent} className="btn btn-gold btn-sm">
            Réserver
          </button>
        </div>

        {/* Mobile toggle — style hamburger fin */}
        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={['h-px w-6 bg-cream transition-all duration-300', open ? 'translate-y-[3.5px] rotate-45' : ''].join(' ')} />
          <span className={['h-px w-6 bg-cream transition-all duration-300', open ? 'opacity-0' : ''].join(' ')} />
          <span className={['h-px w-6 bg-cream transition-all duration-300', open ? '-translate-y-[3.5px] -rotate-45' : ''].join(' ')} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={['overflow-hidden transition-all duration-500 ease-out-quart lg:hidden', open ? 'max-h-[80vh]' : 'max-h-0'].join(' ')}>
        <ul className="container-yard flex flex-col gap-1 py-6">
          {LINKS.map((link) => (
            <li key={link.id}>
              <a href={link.href} onClick={close} className="block rounded-md px-3 py-3 font-accent text-[11px] font-semibold uppercase tracking-luxe text-cream/80 hover:bg-cream/5 hover:text-accent">
                {link.label}
              </a>
            </li>
          ))}
          <li className="flex flex-col gap-2 pt-4">
            <button type="button" onClick={() => { close(); openEvent() }} className="btn btn-gold w-full">
              Réserver
            </button>
            <button type="button" onClick={() => { close(); openReservation() }} className="btn btn-outline w-full text-cream">
              Réserver une table
            </button>
            <button type="button" onClick={() => { close(); openOrder() }} className="btn btn-outline w-full text-cream">
              Commander{count > 0 ? ` (${count})` : ''}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
