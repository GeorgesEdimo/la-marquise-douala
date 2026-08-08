/**
 * Bannière de consentement cookies — affichée une seule fois (stocké dans localStorage).
 * Respecte la vie privée du visiteur et la conformité RGPD.
 */

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'lamarquise_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Affiche uniquement si le consentement n'a pas encore été donné
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[200] border-t border-primary/10 bg-white/95 p-4 shadow-soft-lg backdrop-blur-md sm:p-6">
      <div className="container-yard flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="max-w-2xl text-center text-sm leading-relaxed text-muted sm:text-left">
          🍪 Ce site utilise des cookies pour assurer son bon fonctionnement
          (session de connexion, panier, préférences). Aucun cookie publicitaire
          n'est déposé. En poursuivant votre navigation, vous acceptez l'utilisation
          de ces cookies essentiels.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={accept}
            className="btn btn-primary px-6 py-2.5 text-sm"
          >
            J'accepte
          </button>
          <a
            href="#contact"
            onClick={accept}
            className="btn btn-outline px-6 py-2.5 text-sm text-primary"
          >
            En savoir plus
          </a>
        </div>
      </div>
    </div>
  )
}
