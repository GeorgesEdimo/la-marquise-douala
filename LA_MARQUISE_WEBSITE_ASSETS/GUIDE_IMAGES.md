# 📷 GUIDE D'IMAGES — LA MARQUISE RESTAURANT

Ce guide explique **où trouver** chaque image, **quoi télécharger**, et **où la placer**
dans le site pour remplacer les placeholders.

---

## 1. SOURCES DES IMAGES

| Source | URL | Contenu |
|--------|-----|---------|
| **Google Maps** ⭐ | https://www.google.com/maps/place/LA+MARQUISE+RESTAURANT/@4.02,9.69,15z | Photos clients : salle, bar, plats, extérieur — **meilleure source** |
| **Instagram** ⭐ | https://www.instagram.com/lamarquisedouala/ | Photos HD officielles : plats, cocktails, décor, vidéos |
| **Facebook** | https://www.facebook.com/LaMarquiseRestaurant/ | Ambiance, événements, happy hours |
| **TripAdvisor** | https://www.tripadvisor.fr/Restaurant_Review-g297392-d23352527-Reviews-La_Marquise_Restaurant-Douala_Littoral_Region.html | Photos clients et officielles |

> Astuce Google Maps : clique sur « Photos » puis « Photos du lieu » → clic droit →
> « Enregistrer l'image sous… » pour obtenir la haute résolution.

---

## 2. RUBRIQUE 02_MENU_ET_CARTE/photos_plats/

Télécharge une photo par plat et range-la dans `02_MENU_ET_CARTE/photos_plats/`
puis copie-la dans `LaMarquise/public/images/`.

| Plat | Fichier destination | Source recommandée |
|------|--------------------|--------------------|
| Aarayes Kafta (populaire) | `aarayes-kafta.webp` | Instagram / Google Maps |
| Filet Mignon | `filet-mignon.webp` | Google Maps / Facebook |
| Filet de Bar | `filet-de-bar.webp` | Google Maps |
| Saumon Poireaux & Légumes | `saumon-poireaux.webp` | Google Maps / Facebook |
| Pizza La Marquise | `pizza-marquise.webp` | Facebook / Google Maps |
| Chicken Wings & Fries | `chicken-wings.webp` | Instagram |
| Chicken Strips | `chicken-strips.webp` | Instagram |
| Saumon Maki | `saumon-maki.webp` | Google Maps |
| Bol de Poké St-Jacques | `bol-de-poke.webp` | Google Maps / Facebook |
| Burger La Marquise | `burger-marquise.webp` | Instagram |
| Foie Gras | `foie-gras.webp` | Google Maps |
| Mozzarella Fraîche | `mozzarella-fraiche.webp` | Google Maps |
| Savarin (dessert) | `savarin.webp` | Instagram / Facebook |
| Moelleux Chocolat | `moelleux-chocolat.webp` | Google Maps |

---

## 3. RUBRIQUE 03_MEDIAS_ET_IMAGES/cadre_et_decor/

| Élément | Fichier destination | Source |
|---------|--------------------|--------|
| Salle Fine Dining | `salle-fine-dining.webp` | Google Maps / Instagram |
| Bar à Cocktails | `bar-cocktails.webp` | Instagram / Google Maps |
| Terrasse | `terrasse.webp` | Google Maps |
| Espace de jeux (Playing Area) | `espace-jeux.webp` | Facebook / Instagram |
| Ambiance générale | `ambiance-generale.webp` | Instagram / Facebook |
| Cocktail signature | `cocktail-signature.webp` | Instagram |

---

## 4. RUBRIQUE 03_MEDIAS_ET_IMAGES/bannieres_hero/

4 images grand format (1920×1080 recommandé) pour le diaporama d'accueil :

| Slide | Fichier destination | Idéalement |
|-------|--------------------|------------|
| Slide 1 | `hero-1.webp` | Salle / façade du restaurant |
| Slide 2 | `hero-2.webp` | Ambiance générale / terrasse |
| Slide 3 | `hero-3.webp` | Plat signature (dressage) |
| Slide 4 | `hero-4.webp` | Cocktails / bar |

---

## 5. RUBRIQUE 04_DESIGN_ET_CHARTE/logo/

| Fichier | Description |
|---------|-------------|
| `logo-officiel.png` | Logo officiel du restaurant (si tu peux le récupérer) |
| `logo-officiel-transparent.svg` | Logo sans fond si disponible |

---

## 6. APRÈS TÉLÉCHARGEMENT — METTRE À JOUR LE CODE

Chaque fichier du site pointe actuellement vers un placeholder SVG
(`/images/plat-placeholder.svg`, etc.). Après avoir copié tes vraies photos dans
`LaMarquise/public/images/`, mets à jour les références :

### a) Plats — `src/data/menuItems.ts`
```ts
// AVANT
image: '/images/plat-placeholder.svg',

// APRÈS (exemple pour le kafta)
image: '/images/aarayes-kafta.webp',
```

### b) Galerie — `src/data/galleryItems.ts`
```ts
// AVANT
src: '/images/interieur-placeholder.svg',

// APRÈS
src: '/images/salle-fine-dining.webp',
```

### c) Hero — `src/components/Hero.tsx`
```ts
const SLIDES = [
  '/images/hero-1.webp',
  '/images/hero-2.webp',
  '/images/hero-3.webp',
  '/images/hero-4.webp',
]
```

### d) Section À propos — `src/components/About.tsx`
```ts
src="/images/salle-fine-dining.webp"
src="/images/cocktail-signature.webp"
src="/images/aarayes-kafta.webp"
```

### e) Contact (fond) — `src/components/Contact.tsx`
```ts
style={{ backgroundImage: "url('/images/hero-3.webp')" }}
```

### f) Banner cocktails — `src/components/CocktailsBanner.tsx`
```ts
style={{ backgroundImage: "url('/images/bar-cocktails.webp')" }}
```

---

## 7. RACCOURCI WINDOWS

Double-clique sur `TELECHARGER_IMAGES.bat` dans `LaMarquise/` :
il ouvre Google Maps, Instagram, Facebook et TripAdvisor dans ton navigateur
et affiche ce guide de placement.
