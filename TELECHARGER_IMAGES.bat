@echo off
title La Marquise — Téléchargement d'images
echo ════════════════════════════════════════════════════════════
echo   LA MARQUISE — Guide de téléchargement d'images
echo ════════════════════════════════════════════════════════════
echo.
echo   Ce script ouvre les sources d'images dans ton navigateur.
echo   Télécharge les photos et place-les dans les bons dossiers.
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo   SOURCES PRINCIPALES :
echo.
echo   1. Google Maps (meilleure source — photos clients + officielles)
echo      https://www.google.com/maps/place/LA+MARQUISE+RESTAURANT
echo.
echo   2. Instagram @lamarquisedouala (photos HD des plats, cocktails, décor)
echo      https://www.instagram.com/lamarquisedouala/
echo.
echo   3. Facebook La Marquise Restaurant (photos ambiance, événements)
echo      https://www.facebook.com/LaMarquiseRestaurant/
echo.
echo   4. TripAdvisor (photos clients, plats, ambiance)
echo      https://www.tripadvisor.fr/Restaurant_Review-g297392-d23352527-Reviews-La_Marquise_Restaurant-Douala_Littoral_Region.html
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo   Où ranger les images (dans le dossier LaMarquise/public/images/) :
echo.
echo   PLATS :
echo     → aarayes-kafta.webp
echo     → filet-mignon.webp
echo     → filet-de-bar.webp
echo     → saumon-poireaux.webp
echo     → pizza-marquise.webp
echo     → chicken-wings.webp
echo     → bol-de-poke.webp
echo     → savarin.webp
echo     → cocktail-strawberry.webp
echo.
echo   INTERIEUR / AMBIANCE :
echo     → salle-fine-dining.webp
echo     → bar-cocktails.webp
echo     → terrasse.webp
echo     → espace-jeux.webp
echo     → ambiance-generale.webp
echo.
echo   BANNIERE / HERO :
echo     → hero-1.webp (image large du restaurant)
echo     → hero-2.webp (ambiance/extérieur)
echo     → hero-3.webp (plats signature)
echo     → hero-4.webp (cocktails/bar)
echo.
echo   LOGO :
echo     → logo-officiel.png (ou .svg)
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo   APRÈS TÉLÉCHARGEMENT — Mets à jour les fichiers sources :
echo.
echo   1. src/data/menuItems.ts  → champ "image" de chaque plat
echo   2. src/data/galleryItems.ts → champ "src" de chaque photo galerie
echo   3. src/components/Hero.tsx → tableau SLIDES (images hero)
echo   4. src/components/About.tsx → src des images à propos
echo.
echo   Remplace le nom du fichier (ex: /images/plat-placeholder.svg)
echo   par le vrai nom (ex: /images/aarayes-kafta.webp)
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo   Appuie sur une touche pour ouvrir Google Maps...
pause > nul

echo Ouvrant Google Maps...
start https://www.google.com/maps/place/LA+MARQUISE+RESTAURANT/@4.02,9.69,15z

echo.
echo   Ensuite ouvre Instagram...
pause > nul
start https://www.instagram.com/lamarquisedouala/

echo.
echo   Puis Facebook...
pause > nul
start https://www.facebook.com/LaMarquiseRestaurant/

echo.
echo   Et TripAdvisor...
pause > nul
start https://www.tripadvisor.fr/Restaurant_Review-g297392-d23352527-Reviews-La_Marquise_Restaurant-Douala_Littoral_Region.html

echo.
echo ════════════════════════════════════════════════════════════
echo   Ouvre le dossier d'assets pour voir la structure :
echo   LA_MARQUISE_WEBSITE_ASSETS\
echo ════════════════════════════════════════════════════════════
explorer "C:\Users\DadaSyst\Desktop\LaMarquise\LA_MARQUISE_WEBSITE_ASSETS"
pause
