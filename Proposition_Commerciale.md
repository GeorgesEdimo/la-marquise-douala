---
title: "LA MARQUISE RESTAURANT"
subtitle: "Restaurant · Fast-Food & Fine Dining · Cocktail Bar"
---

# PROPOSITION COMMERCIALE

## Site Web Professionnel & Plateforme de Gestion

**La Marquise Restaurant**
Bonapriso — Rue Tokoto, Douala, Cameroun

Version 1.0 — Août 2026

---

# 1. Présentation du Projet

La Marquise Restaurant est un établissement gastronomique de prestige situé à Bonapriso, Douala, alliant **Fast-Food & Fine Dining**, **Playing Area** et **Cocktail Bar**.

Le site web professionnel développé propose une expérience digitale complète : vitrine du restaurant, réservation en ligne, commandes, gestion d'événements et tableau de bord administratif intégré.

Ce document récapitule les fonctionnalités, avantages, sécurité et points techniques du projet.

---

# 2. Fonctionnalités du Site Public

| Fonctionnalité | Description |
|---|---|
| **Menu interactif** | Grille filtrée par catégorie (entrées, salades, burgers, plats, snacks, desserts). 78+ plats avec prix CFA. Carte complète consultable en flipbook |
| **Réservation de table** | Formulaire en ligne (date, heure, couverts, demandes spéciales). Confirmation instantanée + notification WhatsApp au staff |
| **Événements privés** | Anniversaire, réunion, mariage, corporate, privatisation — formulaire dédié avec choix d'espace, prestations, budget, formule repas |
| **Commandes en ligne** | Sur place, à emporter ou livraison. Panier dynamique. Envoi au staff via WhatsApp |
| **Galerie photos** | Filtrée par catégorie (intérieur, extérieur, plats, cocktails, service). Lightbox interactive |
| **Assistant IA** | Chatbot intelligent (horaires, localisation, menu, réservation) guidant vers les modales de réservation ou de commande |
| **Site responsive** | Mobile, tablette, desktop. Design charcoal & or élégant |
| **Reçus + QR codes** | Chaque interaction génère un reçu avec QR code vers la page de satisfaction |
| **Feedback client** | Page de notation (1-5 étoiles) + commentaire. Avis centralisés dans le dashboard |
| **Liens sociaux** | Instagram (@lamarquisedouala), Facebook, TripAdvisor, Google Maps |
| **SEO** | Meta tags, Open Graph, Schema.org, sitemap.xml, robots.txt. Indexé Google |
| **Accessibilité WCAG** | Focus visible doré, lien « Aller au contenu », ARIA, HTML5 sémantique, contraste |

---

# 3. Fonctionnalités du Dashboard (Back-Office)

| Fonctionnalité | Description |
|---|---|
| **Vue d'ensemble** | KPIs temps réel : CA du jour, commandes en cours, réservations à venir, événements en attente |
| **Gestion des commandes** | Suivi en direct (nouvelles → en préparation → prêtes → livrées). Statuts en un clic |
| **Gestion des réservations** | Liste chronologique, confirmation, assignation de table, statut (en attente → installé) |
| **Gestion des événements** | Suivi devis, acompte, paiement, statut. Reçus WhatsApp manuels à chaque étape |
| **Gestion du menu CRUD** | Ajout/modification/suppression/disponibilité. Mise à jour instantanée du site |
| **Gestion de la galerie CRUD** | Médias, catégorisation, publication/dépublication |
| **Réponse aux clients** | Un clic, message WhatsApp pré-rempli |
| **Reçus WhatsApp** | Confirmation, complétion. QR code + lien feedback inclus |
| **Retours clients** | Tableau des avis (note + commentaire). Filtres par type et note |
| **Utilisateurs & rôles** | Super administrateur, propriétaire, gestionnaire |

---

# 4. Communication Intégrée

**WhatsApp intégré :**
- Staff notifié pour chaque commande/réservation/événement
- Client reçoit reçu à chaque étape
- Réponse en un clic depuis le dashboard

**Reçus & QR Codes :**
- QR unique par interaction
- Client scanne → reçu (détails, statut) + laisse avis (1-5 étoiles + commentaire)
- Retours centralisés dans le dashboard

---

# 5. Avantages Sécurité

| Mesure | Détail |
|---|---|
| **Authentification JWT** | Tokens expirant automatiquement |
| **Protection brute-force** | Blocage après 5 tentatives ratées (5 minutes) |
| **Rôles & permissions** | Super admin, propriétaire, gestionnaire |
| **Protection des comptes** | Impossible de supprimer un super admin / se désactiver soi-même |
| **Base PostgreSQL** | Fiabilité sous forte charge |
| **HTTPS** | SSL Let's Encrypt gratuit |
| **Backups automatiques** | Quotidiens, 30 jours de rétention |

---

# 6. Performance & Fiabilité

| Critère | Détail |
|---|---|
| **Concurrence** | 100+ réservations simultanées testées sans erreur |
| **Architecture** | Python FastAPI, threadpool 100 threads |
| **Infrastructure** | Docker Compose : PostgreSQL, Nginx reverse proxy, cache statique, compression |
| **Cache navigateur** | Images et statiques mis en cache |

---

# 7. Points Forts à Retenir

- Site vitrine + gestion en **UN produit**
- Expérience client fluide (menu flipbook, réservation, commande)
- Notifications WhatsApp **instantanées**
- Gestion temps réel du menu et de la galerie
- QR codes pour la fidélisation
- Sécurité renforcée (JWT, brute-force, HTTPS, backups)
- 100+ réservations simultanées
- SEO complet (Schema.org, Open Graph, sitemap)
- Accessibilité WCAG 2.1
- Déploiement Docker → VPS LWS
- Maintenance en 1 commande

---

# 8. Technologies Utilisées

| Couche | Technologie |
|---|---|
| **Backend** | Python 3.12+ · FastAPI · SQLAlchemy 2.x · PostgreSQL 16 |
| **Frontend** | React 18 · TypeScript 5.x · Tailwind CSS 3.x · Vite 5.x |
| **Infrastructure** | Docker Compose · Nginx · PostgreSQL 16 |
| **Sécurité** | JWT · HTTPS Let's Encrypt · Brute-force protection · Rôles |
| **SEO** | Schema.org · Open Graph · Sitemap XML · Robots.txt |
| **Accessibilité** | WCAG 2.1 |

---

# 9. Conclusion

Ce site n'est pas seulement une vitrine : c'est un **outil de gestion** centralisant réservations, commandes, événements et dialogue client.

Référencé Google, accessible, performant et sécurisé, il est prêt pour la production et accompagné d'une maintenance continue.

**Nous serions honorés de travailler avec La Marquise Restaurant pour concrétiser ce projet.**
