# CAHIER DES CHARGES — THE YARD
## Restaurant Bar Lounge & Traiteur — Douala, Cameroun

---

## 📋 INFORMATIONS GÉNÉRALES

**Nom du projet :** The Yard — Site Web Vitrine & Tableau de Bord  
**Client :** The Yard Restaurant Bar Lounge  
**Localisation :** 737 Rue Batibois, Quartier Bonapriso, Douala, Cameroun  
**Date :** 2026  
**Version :** 2.0  

---

## 🎯 OBJECTIFS DU PROJET

### Objectifs principaux
- Créer un site web vitrine moderne et élégant pour The Yard
- Développer un tableau de bord (dashboard) pour la gestion interne
- Présenter l'univers du restaurant (jardin secret, cocktails signature, DJ Fest)
- Permettre la réservation en ligne via lien téléphonique
- Mettre en valeur la galerie photos/vidéos
- Optimiser le référencement local (SEO)
- Garantir une expérience utilisateur fluide sur tous les appareils
- Offrir un backoffice pour gérer le menu, les réservations et la galerie

### Public cible
- **Visiteurs du site :** Résidents de Douala, expatriés, voyageurs, clients corporate
- **Utilisateurs du dashboard :** Équipe de The Yard (manager, chef, équipe marketing)

---

## 🛠️ TECHNOLOGIES CHOISIES

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18.x | Framework UI composants |
| **TypeScript** | 5.x | Typage statique, robustesse du code |
| **Tailwind CSS** | 3.x | Framework CSS utilitaire |
| **Vite** | 5.x | Build tool & dev server |
| **React Router** | 6.x | Navigation SPA |
| **Google Fonts** | - | Cormorant Garamond, Inter, Outfit |

### Backend (à venir)
| Technologie | Version | Usage |
|-------------|---------|-------|
| **Python** | 3.12+ | Langage serveur |
| **FastAPI** | 0.110+ | Framework API REST |
| **SQLAlchemy** | 2.x | ORM base de données |
| **PostgreSQL** | 16.x | Base de données relationnelle |
| **Pydantic** | 2.x | Validation des données |

### Assets & Médias
- **Formats d'images :** WebP (optimisation), JPG (fallback), PNG (logo)
- **Formats vidéo :** MP4 (H.264) avec fallback WebM
- **Lazy loading :** Attribut natif loading="lazy" + Intersection Observer
- **Responsive images :** srcset pour différentes densités d'écran

### Outils de développement
- **ESLint** — Linting JavaScript/TypeScript
- **Prettier** — Formatage du code
- **Husky** — Git hooks
- **Git** — Versioning

### Performance & Optimisation
- **Preconnect :** Google Fonts, CDN externes
- **Compression :** Images optimisées (WebP)
- **Cache :** Headers de cache navigateur
- **Minification :** Vite + Terser
- **CDN :** Google Fonts, Cloudflare
- **Code splitting :** Vite (lazy loading des composants)

### Accessibilité (WCAG 2.1)
- Attributs ARIA (ole, ria-label, ria-modal)
- Navigation au clavier
- Focus visible (outline doré)
- Textes alternatifs sur toutes les images
- Contraste de couleurs conforme (ratio 4.5:1 minimum)
- Sémantique HTML5 (<nav>, <section>, <article>, <figure>)

### SEO (Référencement)
- **Meta tags :** title, description, Open Graph, Twitter Cards
- **Structured Data :** JSON-LD (Schema.org Restaurant)
- **Sitemap XML :** À générer pour l'indexation
- **Robots.txt :** Configuration de l'indexation
- **URL canonique :** À définir pour éviter le duplicate content

---

## 📐 ARCHITECTURE DU PROJET

### Structure des dossiers
`
theyard/
├── src/
│   ├── components/          # Composants React
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Menu.tsx
│   │   ├── CocktailsBanner.tsx
│   │   ├── Gallery.tsx
│   │   ├── HoursLocation.tsx
│   │   ├── Contact.tsx
│   │   ├── Footer.tsx
│   │   ├── Lightbox.tsx
│   │   ├── FilterButton.tsx
│   │   └── MenuCard.tsx
│   ├── pages/               # Pages de l'application
│   │   ├── HomePage.tsx     # Site public
│   │   ├── Dashboard.tsx    # Tableau de bord admin
│   │   └── Login.tsx        # Authentification admin
│   ├── hooks/               # Custom hooks React
│   │   ├── useCarousel.ts
│   │   ├── useLightbox.ts
│   │   ├── useFilters.ts
│   │   └── useCounters.ts
│   ├── types/               # Interfaces TypeScript
│   │   ├── menu.ts
│   │   ├── gallery.ts
│   │   └── user.ts
│   ├── data/                # Données statiques (avant backend)
│   │   ├── menuItems.ts
│   │   ├── galleryItems.ts
│   │   └── hours.ts
│   ├── styles/              # Styles CSS
│   │   ├── index.css        # Tailwind directives
│   │   └── animations.css   # Animations custom
│   ├── App.tsx              # Composant racine
│   └── main.tsx             # Point d'entrée
├── public/                  # Assets statiques
│   ├── images/
│   ├── videos/
│   └── favicon.ico
├── maketetes/               # Maquettes et documentation
│   ├── README.md
│   ├── mockup-home.txt          # Wireframe texte - Accueil
│   ├── mockup-gallery.txt       # Wireframe texte - Galerie
│   ├── mockup-menu.txt          # Wireframe texte - Menu
│   ├── mockup-homepartie1.png   # Maquette visuelle - Accueil (1/2)
│   ├── mockup-homepartie2.png   # Maquette visuelle - Accueil (2/2)
│   ├── mockup-dashboard.png     # Maquette visuelle - Tableau de bord
│   ├── Dashboard.png            # Capture du dashboard existant
│   └── logo-removebg-preview.png
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
└── CAHIER_DES_CHARGES.md
`

---

## 🎨 DESIGN SYSTEM

### Palette de couleurs (Tailwind config)
`javascript
colors: {
  primary: {
    DEFAULT: '#1a3a2a',
    light: '#2d5a3f',
    dark: '#0d1f15',
  },
  accent: {
    DEFAULT: '#c8a45a',
    light: '#dfc07d',
    dark: '#a07d3a',
  },
  gold: '#d4a843',
}
`

### Typographie
- **Titres :** Cormorant Garamond (serif élégant)
- **Corps :** Inter (sans-serif moderne)
- **Accent :** Outfit (géométrique, moderne)

### Espacement & Bordures
- **Container max-width :** 1280px
- **Padding section :** py-20 md:py-32 (responsive)
- **Border radius :** ounded-lg, ounded-xl, ounded-2xl

---

## ⚡ FONCTIONNALITÉS

### ✅ Site Public (React + TS + Tailwind)

#### Page d'accueil
- [x] Carrousel d'images hero (4 slides, transition 1.5s)
- [x] Logo dans le hero
- [x] Navigation fixe avec changement d'état au scroll
- [x] Menu mobile (hamburger)
- [x] Galerie avec filtres par catégorie
- [x] Lightbox pour les images de la galerie
- [x] Compteurs animés (statistiques cocktails)
- [x] Lazy loading des images
- [x] Structured Data JSON-LD
- [x] Responsive design (mobile, tablette, desktop)

#### Tableau de bord (Dashboard)
- [ ] Authentification admin (login)
- [ ] Vue d'ensemble avec KPIs (CA journalier, nb réservations, etc.)
- [ ] Gestion du menu (CRUD plats)
- [ ] Gestion de la galerie (upload photos/vidéos)
- [ ] Gestion des horaires d'ouverture
- [ ] Visualisation des réservations
- [ ] Statistiques de fréquentation
- [ ] Export de données (PDF, CSV)

### 🔄 À venir (Backend Python FastAPI)
- [ ] API REST pour le menu
- [ ] API REST pour les réservations
- [ ] API REST pour la galerie
- [ ] API REST pour les statistiques
- [ ] Système d'authentification JWT
- [ ] Base de données PostgreSQL
- [ ] Panel d'administration complet

---

## 📚 MAQUETTES & DOCUMENTATION

### 📄 Maquettes textuelles (Wireframes)
Le projet dispose de **wireframes textuels détaillés** décrivant chaque section :

| Fichier | Contenu |
|---------|---------|
| maketetes/mockup-home.txt | Wireframe complet de la page d'accueil (hero, à propos, menu, cocktails, galerie, horaires, contact, footer) |
| maketetes/mockup-gallery.txt | Wireframe détaillé de la galerie (filtres, grille maçonnerie, lightbox, behind the scenes) |
| maketetes/mockup-menu.txt | Wireframe détaillé de la section menu (filtres catégories, cartes plats, menu du jour, barre de réservation mobile) |

### 🖼️ Maquettes visuelles (Mockups images)
Le projet dispose de **captures visuelles** des maquettes :

| Fichier | Contenu |
|---------|---------|
| maketetes/mockup-homepartie1.png | Maquette visuelle partie 1 — Accueil (hero + sections principales) |
| maketetes/mockup-homepartie2.png | Maquette visuelle partie 2 — Sections détaillées + footer |
| maketetes/mockup-dashboard.png | Maquette visuelle du tableau de bord admin |
| maketetes/Dashboard.png | Capture du dashboard existant (référence design) |
| maketetes/logo-removebg-preview.png | Logo The Yard sans fond (référence branding) |

### 🎯 Utilisation des maquettes
- **Wireframes texte** : Spécifications fonctionnelles (structure, contenu, interactions)
- **Maquettes visuelles** : Références graphiques (couleurs, typographie, mise en page, ambiance)
- **Dashboard** : Design de référence pour le backoffice admin

---

## 📱 RESPONSIVE DESIGN

### Breakpoints Tailwind
`javascript
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
`

### Adaptations mobiles
- Menu hamburger (lg:hidden)
- Grilles en colonne unique sur mobile
- Boutons pleine largeur
- Galerie en 1 colonne
- Barre de réservation fixe en bas (mobile)

---

## 🚀 DÉPLOIEMENT

### Options d'hébergement Frontend (React)
1. **Vercel** (recommandé) — Optimisé pour React/Vite
2. **Netlify** — Simple et rapide
3. **Cloudflare Pages** — Performance mondiale

### Options d'hébergement Backend (Python)
1. **Render** — Gratuit pour commencer
2. **Railway** — Simple déploiement
3. **Fly.io** — Performance globale

### Domaine
- Domaine personnalisé recommandé : 	heyard-douala.com
- Sous-domaine dashboard : dmin.theyard-douala.com

---

## 📊 MÉTRIQUES DE SUCCÈS

### Performance
- **Lighthouse Score :** > 90 (Performance, Accessibility, SEO)
- **First Contentful Paint :** < 1.5s
- **Largest Contentful Paint :** < 2.5s
- **Time to Interactive :** < 3s

### SEO
- Indexation de toutes les pages
- Apparition dans les résultats locaux (Google Maps)
- Rich snippets (étoiles, horaires, menu)

### Accessibilité
- Conformité WCAG 2.1 niveau AA
- Navigation clavier complète
- Lecteur d'écran compatible

---

## 📅 PLANNING

### Phase 1 — Setup & MVP Site Public (✅ En cours)
- Initialisation projet React + TS + Tailwind + Vite
- Configuration ESLint, Prettier
- Structure des composants
- Migration du HTML/CSS existant vers React

### Phase 2 — Site Public Complet (🔄 À faire)
- Toutes les sections (Hero, About, Menu, Galerie, Contact)
- Animations et interactions
- Optimisations performance
- Tests responsive

### Phase 3 — Dashboard Admin (📋 Planifié)
- Authentification
- Interface de gestion
- Visualisation des données
- Connexion API backend

### Phase 4 — Backend Python (📋 Planifié)
- API REST avec FastAPI
- Base de données PostgreSQL
- Authentification JWT
- Déploiement

### Phase 5 — Déploiement Final
- Build production
- Tests E2E
- Mise en ligne
- Monitoring

---

## 👥 ÉQUIPE & RÔLES

- **Chef de projet :** [À définir]
- **Designer UI/UX :** [À définir]
- **Développeur Frontend (React/TS) :** [À définir]
- **Développeur Backend (Python) :** [À définir]
- **SEO Specialist :** [À définir]

---

## 💰 BUDGET ESTIMÉ

### Développement
- Frontend React + TS + Tailwind : [Selon prestataire]
- Backend Python FastAPI : [Selon prestataire]
- Design UI/UX : [Selon prestataire]

### Infrastructure mensuelle
- Hébergement Frontend (Vercel) : 0-20€/mois
- Hébergement Backend (Render) : 0-25€/mois
- Base de données PostgreSQL : 0-15€/mois
- Domaine : ~15€/an
- CDN (Cloudflare) : 0-20€/mois

---

## 📞 CONTACT

**Téléphone :** +237 6 71 49 07 33  
**Instagram :** [@theyard_dla](https://www.instagram.com/theyard_dla/)  
**Adresse :** 737 Rue Batibois, Bonapriso, Douala, Cameroun  

---

## 📝 NOTES & RÉFÉRENCES

### Maquettes et documentation
- **Wireframes texte :** maketetes/mockup-home.txt, mockup-gallery.txt, mockup-menu.txt
- **Maquettes visuelles site :** maketetes/mockup-homepartie1.png, mockup-homepartie2.png
- **Maquette dashboard :** maketetes/mockup-dashboard.png, Dashboard.png
- **Logo :** maketetes/logo-removebg-preview.png

### Assets média
- **Logo :** public/images/logo_theyard.png
- **Photos hero :** public/images/the yard *.webp
- **Photos menu :** public/medias/menu_photos/
- **Vidéos :** public/videos/hero-bg.mp4, spotlight.mp4

---

*Document mis à jour le 31 juillet 2026*  
*Version 2.0 — Migration vers React + TypeScript + Tailwind CSS*
