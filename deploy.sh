#!/usr/bin/env bash
#
# La Marquise — Script de déploiement sur VPS (LWS ou autre, Ubuntu/Debian).
# Usage : bash deploy.sh
#
set -euo pipefail

echo "═══════════════════════════════════════════"
echo "  La Marquise — Déploiement"
echo "═══════════════════════════════════════════"

# ── 1. Vérifications ──
command -v docker >/dev/null 2>&1 || { echo "✗ Docker n'est pas installé. Voir DEPLOY.md étape 2."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || { echo "✗ docker-compose manquant."; exit 1; }
[ -f .env ] || { echo "✗ .env introuvable. Copie .env.production → .env puis remplis les valeurs."; exit 1; }

echo "✓ Docker et .env présents."

# ── 2. Build du frontend ──
echo ""
echo "── Build du frontend React…"
if [ -f package.json ]; then
  npm ci || npm install
  npm run build
  echo "✓ Frontend buildé."
  # Copie le build vers le dossier servi par nginx
  mkdir -p public
  cp -r dist/* public/ 2>/dev/null || true
fi

# ── 3. Lancement des services ──
echo ""
echo "── Démarrage PostgreSQL + API + Nginx…"
docker compose up -d --build

# ── 4. Attente du backend ──
echo ""
echo "── Vérification de l'API…"
for i in $(seq 1 15); do
  if curl -sf http://localhost:8000/api/v1/health >/dev/null 2>&1; then
    echo "✓ API en ligne !"
    break
  fi
  echo "  (attente du backend… $i/15)"
  sleep 2
done

# ── 5. Seed admin + menu ──
echo ""
echo "── Initialisation de la base (seed admin + menu)…"
docker compose exec api python -m app.seed

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ Déploiement terminé !"
echo "  Site public : http://$(hostname -I 2>/dev/null | awk '{print $1}')"
echo "  Dashboard   : /admin/login"
echo "  Docs API    : /docs"
echo "  (Configure le domaine + HTTPS — voir DEPLOY.md)"
echo "═══════════════════════════════════════════"
