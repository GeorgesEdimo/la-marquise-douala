# Guide de déploiement — The Yard

## Vue d'ensemble

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client     │────▶│  Nginx :443  │────▶│  FastAPI :8000│
│  (navigateur)│     │  HTTPS/SSL   │     │  Docker     │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                          ┌─────▼──────┐
                                          │ PostgreSQL  │
                                          │  :5432      │
                                          └────────────┘
```

**VPS LWS minimum** : Ubuntu 22.04, 2 Go RAM, 25 Go SSD.

---

## Étape 1 : Commander le VPS

1. Sur [lws.fr](https://www.lws.fr) → VPS Linux (Ubuntu)
2. Plan recommandé : **VPS Start** (4 Go RAM, 80 Go SSD, ~6€/mois)
3. Tu reçois un email avec :
   - IP publique du serveur
   - Mot de passe root

---

## Étape 2 : Installer Docker sur le VPS

Connecte-toi en SSH :

```bash
ssh root@ADRESSE_IP_VPS
```

Puis installe Docker :

```bash
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin git

# Ajoute ton compte au groupe docker
usermod -aG docker root

# Vérifie
docker --version
docker compose version
```

---

## Étape 3 : Cloner le projet

```bash
cd /opt
git clone https://github.com/TON_USER/theyard-v0.git
cd theyard-v0
```

Si tu n'as pas de dépôt Git, copie le dossier du projet avec scp :

```bash
# Depuis TA machine Windows :
scp -r "C:\Users\DadaSyst\Desktop\theyard v0" root@ADRESSE_IP_VPS:/opt/theyard-v0
```

---

## Étape 4 : Configurer les variables

```bash
cd /opt/theyard-v0

# Copie le template de production
cp backend/.env.production .env
```

**Modifie `.env`** avec `nano .env` — tu dois AU MINIMUM remplacer :

| Variable | Valeur |
|---|---|
| `SECRET_KEY` | **Génère-la** : `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `FIRST_ADMIN_PASSWORD` | Un mot de passe fort unique |
| `FIRST_ADMIN_EMAIL` | L'email que tu utiliseras pour le dashboard |
| `DB_PASSWORD` | Un mot de passe fort pour la base PostgreSQL |
| `CORS_ORIGINS` | Ton domaine : `https://theyard.cm,https://www.theyard.cm` |
| `SITE_URL` | `https://theyard.cm` |
| `DEBUG` | `False` |

---

## Étape 5 : Lancer

```bash
cd /opt/theyard-v0
bash deploy.sh
```

Le script :
- Build le frontend React
- Lance Docker Compose (PostgreSQL + Backend + Nginx)
- Attend que l'API soit prête
- Initialise la base (seed admin + menu)

---

## Étape 6 : Domaine + HTTPS

### 6.1 Acheter un domaine

Sur LWS ou un registrar : achète un domaine (ex : `theyard.cm`).

### 6.2 Orienter le DNS

Dans le panneau DNS de ton registrar, ajoute :

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | `ADRESSE_IP_VPS` |
| A | `www` | `ADRESSE_IP_VPS` |

### 6.3 Obtenir le certificat HTTPS

Attends 10 minutes que le DNS se propage, puis :

```bash
cd /opt/theyard-v0
docker compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot \
  -d theyard.cm -d www.theyard.cm \
  --agree-tos --email TON_EMAIL
```

Redémarre nginx :
```bash
docker compose restart nginx
```

Le site est maintenant accessible sur `https://theyard.cm` !

---

## Étape 7 : Sauvegarde automatique

Ajoute une tâche cron pour sauvegarder la base PostgreSQL quotidiennement :

```bash
chmod +x /opt/theyard-v0/backend/backup.sh

# Backup chaque jour à 3h du matin
crontab -e
# Ajouter la ligne :
0 3 * * * /opt/theyard-v0/backend/backup.sh >> /var/log/the_yard_backup.log 2>&1
```

---

## Étape 8 : Seed du menu complet

Le seed crée un menu de démo (21 plats). Pour charger le menu complet du restaurant :

```bash
# Depuis le dashboard Admin → Menu → Ajouter les plats manquants
# Ou importe directement en base
docker compose exec api python -m app.seed
```

---

## Maintenance

### Mise à jour du code

```bash
cd /opt/theyard-v0
git pull origin main

# Reconstruit et relance
docker compose up -d --build
docker compose exec api python -m app.seed  # si nécessaire
```

### Logs

```bash
docker compose logs -f api      # logs du backend
docker compose logs -f nginx    # logs du proxy
```

### Arrêter

```bash
docker compose down             # arrête tout, garde les données
docker compose down -v          # arrête ET SUPPRIME la base !!
```

---

## Checklist de sécurité

- [ ] `SECRET_KEY` est une vraie clé (pas le template)
- [ ] `DEBUG=False`
- [ ] `FIRST_ADMIN_PASSWORD` est modifié
- [ ] `DB_PASSWORD` est modifié
- [ ] HTTPS actif (Let's Encrypt)
- [ ] `SITE_URL` pointe vers le domaine
- [ ] `CORS_ORIGINS` contient le domaine
- [ ] Backup cron configuré
- [ ] `/docs` (Swagger) désactivé ou protégé si besoin : retire `docs_url="/docs"` de `main.py`
