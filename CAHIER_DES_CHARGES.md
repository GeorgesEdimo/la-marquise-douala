# CAHIER DES CHARGES — LA MARQUISE RESTAURANT
## Fast-Food & Fine Dining · Playing Area · Cocktail Bar — Douala, Cameroun

---

**Nom du projet :** La Marquise — Site Web Vitrine & Tableau de Bord
**Client :** La Marquise Restaurant
**Localisation :** Rue Tokoto, Bonapriso, Douala, Cameroun
**Date :** 2026 — Version 2.0

---

## 1. Objectifs du Projet

### Objectifs principaux

1. Créer un site vitrine moderne et élégant, fidèle à l'identité visuelle charcoal & or de La Marquise
2. Développer un dashboard de gestion interne pour les commandes, réservations et événements
3. Présenter l'univers du restaurant : Fast-Food & Fine Dining, Playing Area, Cocktail Bar
4. Permettre la réservation en ligne via formulaire intégré
5. Permettre les commandes en ligne (sur place, à emporter, livraison)
6. Valoriser la galerie photos/vidéos du restaurant
7. Optimiser le référencement local (SEO Google)
8. Expérience fluide sur tous appareils (responsive)
9. Backoffice pour gestion du menu, réservations, galerie et événements

### Public cible

- **Visiteurs :** Résidents de Douala, expatriés, voyageurs, clientèle corporate, familles
- **Utilisateurs du dashboard :** Manager, chef, équipe marketing, propriétaire

---

## 2. Technologies

### Frontend

| Technologie | Version | Usage |
|---|---|---|
| React | 18.x | Framework UI |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 3.x | Styling utility-first |
| Vite | 5.x | Build tool + dev server |
| React Router | 6.x | Routage SPA |

### Backend

| Technologie | Version | Usage |
|---|---|---|
| Python | 3.12+ | Langage backend |
| FastAPI | 0.115+ | Framework API REST |
| SQLAlchemy | 2.x | ORM |
| PostgreSQL | 16.x | Base de données prod |
| SQLite | — | Base de données dev |
| Pydantic | 2.x | Validation des schémas |

### Assets & Médias

- **Formats :** WebP (optimisation), JPG (fallback), PNG (logo), SVG (icônes)
- **Lazy loading :** `loading="lazy"` + Intersection Observer
- **Responsive :** srcset pour les images selon la taille d'écran

### Outils de développement

- ESLint + Prettier (formatage du code)
- Git (versionning)
- Docker Compose (conteneurisation)

---

## 3. Performance & SEO

### Performance

- Preconnect Google Fonts / CDN
- Compression WebP pour toutes les images
- Headers cache navigateur (Vercel + Nginx)
- Minification Vite + Terser
- Code splitting automatique
- 100+ utilisateurs simultanés testés sans erreur

### SEO

- Meta tags (title, description, Open Graph, Twitter Cards)
- JSON-LD Schema.org (type Restaurant)
- Sitemap XML + robots.txt
- Conformité WCAG 2.1

---

## 4. Architecture du Projet

```
LaMarquise/
├── src/
│   ├── components/     # React (Navbar, Hero, Menu, Galerie...)
│   ├── pages/admin/    # Dashboard (Orders, Reservations, Events...)
│   ├── api/            # Modules API frontend (auth, menu, orders...)
│   ├── hooks/          # Custom hooks (useBooking, useCart, useAuth...)
│   ├── data/           # Données statiques (menu, boissons, horaires...)
│   └── styles/         # CSS global (index.css)
├── backend/
│   └── app/
│       ├── api/        # Routes API (12 routeurs)
│       ├── models/     # Modèles SQLAlchemy (User, Order, Reservation...)
│       ├── services/   # Services métier (receipts, whatsapp, reference...)
│       ├── core/       # Configuration, sécurité, base de données
│       └── seed.py     # Script d'initialisation (tables + admin + menu)
├── public/images/      # Images optimisées (plats, intérieurs, extérieurs)
└── docker-compose.yml  # Infra Docker (PostgreSQL + API + Nginx)
```

---

## 5. Fonctionnalités

### 5.1 Site Public

| # | Fonctionnalité | Statut |
|---|---|---|
| 1 | Carrousel hero avec slideshow (photos réelles) | ✓ |
| 2 | Navigation fixe responsive avec underline hover | ✓ |
| 3 | Section « Notre Histoire » avec images | ✓ |
| 4 | Menu interactif (7 catégories, filtres, cartes) | ✓ |
| 5 | Carte complète (flipbook interactif) | ✓ |
| 6 | Réservation de table | ✓ |
| 7 | Réservation d'événements (6 types) | ✓ |
| 8 | Commandes en ligne (3 modes) | ✓ |
| 9 | Galerie photos avec lightbox | ✓ |
| 10 | Assistant IA (chatbot) | ✓ |
| 11 | Horaires & Google Maps intégré | ✓ |
| 12 | Reçus avec QR codes | ✓ |
| 13 | Feedback client (1-5 étoiles) | ✓ |
| 14 | Responsive (mobile, tablette, desktop) | ✓ |
| 15 | SEO complet (Schema.org, Open Graph, sitemap) | ✓ |

### 5.2 Dashboard Admin

| # | Fonctionnalité | Statut |
|---|---|---|
| 1 | Authentification JWT sécurisée | ✓ |
| 2 | Vue d'ensemble (KPIs temps réel) | ✓ |
| 3 | Gestion des commandes (CRUD + statuts) | ✓ |
| 4 | Gestion des réservations (CRUD + statuts) | ✓ |
| 5 | Gestion des événements (devis, acompte) | ✓ |
| 6 | Gestion du menu (CRUD) | ✓ |
| 7 | Gestion de la galerie (CRUD) | ✓ |
| 8 | Réponse aux clients (WhatsApp) | ✓ |
| 9 | Reçus WhatsApp manuels | ✓ |
| 10 | Retours clients | ✓ |
| 11 | Utilisateurs avec rôles (3 niveaux) | ✓ |

### 5.3 Communication & Sécurité

| # | Fonctionnalité | Statut |
|---|---|---|
| 1 | WhatsApp Cloud API au staff | ✓ |
| 2 | Reçus automatiques à chaque étape | ✓ |
| 3 | QR codes sur chaque reçu | ✓ |
| 4 | Protection brute-force (5 tentatives) | ✓ |
| 5 | HTTPS Let's Encrypt gratuit | ✓ |
| 6 | Backups PostgreSQL quotidiens | ✓ |
| 7 | Docker Compose | ✓ |

---

## 6. Menu Complet (78+ plats)

Le site intègre le menu complet de La Marquise Restaurant avec les catégories suivantes :

- **Starters & Entrées** — 17 plats (French Fries, Nuggets, Tenders, Chicken Wings, Shawarma, Foie Gras, Nachos, Edamame, Bruschetta...)
- **Salades** — 9 variétés (Green, Caesar, Tuna Pasta, Roasted Beef, La Marquise, Carpaccio, Poké...)
- **Burgers & Sandwiches** — 14 variétés (Beef, Chicken, Zinger, Fish, Veggie, Fajitas, Marquise Chicken/Steak...)
- **Plats Principaux** — 6 plats (Pizza Marquise, Margherita, Pepperoni, Saumon Maki, Filet Mignon, Filet de Bar...)
- **Fried Chicken & Kids** — 8 formules (Wings Meal, Chicken Meal, Crispy Meal, Beef Kids, Chicken Kids...)
- **Desserts & Waffles** — 6 desserts (Savarin, Bubble Waffle Oreo/Lotus/Strawberry, Sundae, Moelleux Chocolat)
- **Boissons** — 30+ boissons (Milkshakes, Fresh Juices, Sodas, Coffee & Tea, Cocktails, Bières)

Prix affichés en **CFA**. Tranche : 1 000 à 23 000 CFA par personne.

---

## 7. Maquettes & Documentation

| Document | Contenu |
|---|---|
| Proposition commerciale | Fonctionnalités détaillées, technologies, avantages |
| Contrat de prestation | Contrat clé en main + comparaison des offres |
| Cahier des charges | Ce document |
| Guide de déploiement | Instructions techniques pour la mise en production |
| Présentation responsive | Mockup desktop, laptop, tablette et mobile |

---

## 8. Déploiement

### Frontend

- **Hébergement :** Vercel
- **Build :** Auto depuis GitHub (`npm run build`)
- **Domaine :** `lamarquise-douala.vercel.app`

### Backend

- **Hébergement :** VPS LWS (Docker)
- **Stack :** PostgreSQL 16 + FastAPI + Nginx
- **SSL :** HTTPS Let's Encrypt gratuit
- **Backups :** Quotidiens, 30 jours de rétention

### Base de données

- **Production :** PostgreSQL 16
- **Développement :** SQLite
- **Migrations :** Automatiques au démarrage

---

## 9. Planning

| Phase | Description | Durée |
|---|---|---|
| 1 | Setup & MVP Site Public | 1 semaine |
| 2 | Site Public Complet (menu, galerie, réservation) | 1 semaine |
| 3 | Dashboard Admin | 1 semaine |
| 4 | Backend FastAPI (12 routes) | 1 semaine |
| 5 | Sécurité, SEO, Accessibilité | 3 jours |
| 6 | Tests concurrence 100+ | 2 jours |
| 7 | Production Docker + PostgreSQL + HTTPS | 2 jours |
| 8 | Déploiement Vercel + VPS LWS | 2 jours |
| **Total** | | **4-6 semaines** |

---

## 10. Infrastructure Mensuelle

| Poste | Coût estimé |
|---|---|
| Frontend Vercel | 0-20€/mois |
| Backend VPS LWS | ~6€/mois |
| PostgreSQL | Incluse dans VPS |
| Domaine | ~15€/an |
| CDN Cloudflare | 0-20€/mois |

---

*Document mis à jour le 8 août 2026 — Version 2.0*
