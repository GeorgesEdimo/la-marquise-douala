"""
Tests d'intégration complets — La Marquise API.

Lance UNIQUEMENT sur ta machine Windows (backend en cours d'exécution) :

    cd backend
    .venv\\Scripts\\python test_integration.py

ou double-clic sur run_tests.bat.

Couvre : santé, auth, menu, galerie, commandes, réservations, événements,
stats, réponses clients, utilisateurs, et la concurrence (100 requêtes simultanées).
"""

import json
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

# ─── Configuration ───
BASE = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@lamarquise-douala.com"
ADMIN_PASSWORD = "LaMarquise2026!"

PASSED = 0
FAILED = 0
FAILURES = []


def log(ok: bool, name: str, detail: str = ""):
    global PASSED, FAILED
    if ok:
        PASSED += 1
        print(f"  ✓ {name}")
    else:
        FAILED += 1
        FAILURES.append(f"{name} — {detail}")
        # Affiche les 200 premiers caractères du détail pour diagnostic
        short = detail[:200] if detail else ""
        print(f"  ✗ {name} — {short}")


# ─── Helpers HTTP ───

def request(method: str, path: str, data=None, token: str | None = None, raw: bool = False, timeout: float = 30):
    """Requête HTTP avec gestion JSON. Retourne (status, body_dict)."""
    url = f"{BASE}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = resp.status
            payload = resp.read()
            parsed = json.loads(payload) if payload else {}
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            parsed = json.loads(e.read())
        except Exception:
            parsed = {"detail": e.reason}
    except Exception as e:
        return 0, {"detail": f"Réseau : {e}"}

    if raw:
        return status, parsed
    return status, parsed


def login(email=ADMIN_EMAIL, password=ADMIN_PASSWORD) -> tuple[str, str]:
    """Retourne (token, erreur)."""
    body = urllib.parse.urlencode({"username": email, "password": password}).encode()
    req = urllib.request.Request(
        f"{BASE}/auth/login", data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            return data.get("access_token", ""), ""
    except urllib.error.HTTPError as e:
        return "", f"HTTP {e.code}"
    except Exception as e:
        return "", str(e)


# ─── Suite de tests ───

def test_health():
    print("\n── Santé ──")
    status, body = request("GET", "/health")
    log(status == 200 and body.get("status") == "ok", "GET /health", str(body))


def test_auth():
    print("\n── Authentification ──")
    token, err = login()
    log(bool(token), "Login admin → token JWT", err or "aucun token")

    if not token:
        print("  ✗ Suite des tests impossible sans token.")
        return ""

    status, me = request("GET", "/auth/me", token=token)
    log(status == 200 and me.get("email") == ADMIN_EMAIL, "GET /auth/me renvoie l'admin",
        f"status={status}")

    # Mauvaise connexion
    _, err = login(password="mauvais-mdp")
    log(bool(err), "Login mauvais mdp → rejeté")

    return token


def test_menu(token):
    print("\n── Menu CRUD ──")
    status, items = request("GET", "/menu?available_only=true", token=token)
    log(status == 200 and isinstance(items, list), "GET /menu liste", f"status={status}")

    status, created = request("POST", "/menu", token=token, data={
        "slug": "test-plat-integration",
        "name": "Plat Test Intégration",
        "description": "Créé par le script de test",
        "price": 5000,
        "category": "plat",
    })
    log(status in (200, 201) and created.get("id"), "POST /menu crée", f"status={status}")
    if status not in (200, 201):
        return
    menu_id = created["id"]

    status, updated = request("PATCH", f"/menu/{menu_id}", token=token, data={"price": 5500})
    log(status == 200 and updated.get("price") == 5500, "PATCH /menu/{id} prix→5500",
        f"status={status}")

    status, _ = request("DELETE", f"/menu/{menu_id}", token=token)
    log(status == 204, "DELETE /menu/{id} supprime", f"status={status}")


def test_gallery(token):
    print("\n── Galerie CRUD ──")
    status, images = request("GET", "/gallery", token=token)
    log(status == 200 and isinstance(images, list), "GET /gallery liste", f"status={status}")

    status, created = request("POST", "/gallery", token=token, data={
        "src": "/images/test-integration.webp",
        "alt": "Test intégration",
        "caption": "Image créée par le test",
        "category": "interieur",
    })
    log(status in (200, 201) and created.get("id"), "POST /gallery crée", f"status={status}")
    if status not in (200, 201):
        return
    img_id = created["id"]

    status, updated = request("PATCH", f"/gallery/{img_id}", token=token,
                              data={"is_published": True})
    log(status == 200 and updated.get("is_published") is True, "PATCH /gallery/{id} publie",
        f"status={status}")

    status, _ = request("DELETE", f"/gallery/{img_id}", token=token)
    log(status == 204, "DELETE /gallery/{id} supprime", f"status={status}")


def test_reservations(token):
    print("\n── Réservations ──")
    status, created = request("POST", "/reservations", data={
        "customer_name": "Test Résa",
        "customer_phone": "+237690000001",
        "reservation_date": "2030-01-15",
        "reservation_time": "19:30:00",
        "party_size": 4,
    })
    log(status in (200, 201) and created.get("reservation", {}).get("reference"),
        "POST /reservations crée", f"status={status} body={json.dumps(created)[:200]}")
    if status not in (200, 201):
        return
    ref = created["reservation"]["reference"]
    resa_id = created["reservation"]["id"]
    log(ref.startswith("RS-"), "Référence RS-XXXXXX", ref)

    status, _ = request("PATCH", f"/reservations/{resa_id}", token=token,
                        data={"status": "confirmed"})
    log(status == 200, "PATCH /reservations/{id} confirme", f"status={status}")


def test_events(token):
    print("\n── Événements ──")
    status, created = request("POST", "/events", data={
        "customer_name": "Test Événement",
        "customer_phone": "+237690000002",
        "event_type": "anniversaire",
        "event_date": "2030-02-20",
        "start_time": "18:00:00",
        "guest_count": 30,
    })
    log(status in (200, 201) and created.get("event", {}).get("reference"),
        "POST /events crée", f"status={status} body={json.dumps(created)[:200]}")
    if status not in (200, 201):
        return
    event_id = created["event"]["id"]
    log(created["event"]["reference"].startswith("EV-"), "Référence EV-XXXXXX",
        created["event"]["reference"])

    status, _ = request("PATCH", f"/events/{event_id}", token=token,
                        data={"status": "confirmed"})
    log(status == 200, "PATCH /events/{id} confirme", f"status={status}")


def test_orders(token):
    print("\n── Commandes ──")
    # Récupère un plat existant pour le panier
    status, items = request("GET", "/menu?available_only=true", token=token)
    menu_id = items[0]["id"] if items else None
    log(menu_id is not None, "Un plat dispo existe pour le test", f"status={status}")

    status, created = request("POST", "/orders", data={
        "customer_name": "Test Commande",
        "customer_phone": "+237690000003",
        "order_type": "takeaway",
        "items": [{"menu_item_id": menu_id, "quantity": 2}],
    })
    log(status in (200, 201) and created.get("order", {}).get("reference"),
        "POST /orders crée", f"status={status}")
    if status not in (200, 201):
        return
    order_id = created["order"]["id"]
    log(created["order"]["reference"].startswith("YD-"), "Référence YD-XXXXXX",
        created["order"]["reference"])

    status, _ = request("PATCH", f"/orders/{order_id}", token=token,
                        data={"status": "preparing"})
    log(status == 200, "PATCH /orders/{id} préparation", f"status={status}")


def test_stats(token):
    print("\n── Stats ──")
    status, stats = request("GET", "/stats/overview", token=token)
    log(status == 200 and isinstance(stats, dict), "GET /stats/overview",
        f"status={status}")


def test_replies(token):
    print("\n── Réponses clients ──")
    status, created = request("POST", "/reservations", data={
        "customer_name": "Test Réponse",
        "customer_phone": "+237690000004",
        "reservation_date": "2030-03-10",
        "reservation_time": "20:00:00",
        "party_size": 2,
    })
    if status not in (200, 201):
        log(False, "Création résa pour test réponse", f"status={status}")
        return
    resa_id = created["reservation"]["id"]

    status, resp = request("POST", f"/replies/reservation/{resa_id}", token=token,
                           data={"message": "Votre table est confirmée !"})
    log(status == 200 and resp.get("customer_phone") == "+237690000004",
        "POST /replies/reservation/{id}", f"status={status}, resp={resp}")


def test_users(token):
    print("\n── Utilisateurs (super admin) ──")
    status, users = request("GET", "/users", token=token)
    log(status == 200 and isinstance(users, list), "GET /users liste",
        f"status={status}")

    email = f"test-{int(time.time())}@marquise-integration.cm"
    status, created = request("POST", "/users", token=token, data={
        "email": email,
        "full_name": "Compte Test",
        "password": "Test12345!",
        "role": "manager",
    })
    log(status in (200, 201) and created.get("id"), "POST /users crée manager",
        f"status={status} body={json.dumps(created)[:200]}")
    if status not in (200, 201):
        return
    user_id = created["id"]

    status, _ = request("PATCH", f"/users/{user_id}", token=token,
                        data={"role": "owner"})
    log(status == 200, "PATCH /users/{id} rôle→owner", f"status={status}")

    status, _ = request("DELETE", f"/users/{user_id}", token=token)
    log(status == 204, "DELETE /users/{id} supprime", f"status={status}")


def test_concurrency(token):
    print("\n── Concurrence : 100 réservations simultanées ──")
    n = 100
    results: list[tuple[int, dict]] = []
    lock = threading.Lock()
    start = time.time()

    def worker(i):
        s, body = request("POST", "/reservations", data={
            "customer_name": f"Conc{i}",
            "customer_phone": f"+2376901{i:05d}",
            "reservation_date": "2030-04-01",
            "reservation_time": "19:00:00",
            "party_size": 2,
        }, timeout=60)
        with lock:
            results.append((s, body))

    threads = [threading.Thread(target=worker, args=(i,)) for i in range(n)]
    for t in threads: t.start()
    for t in threads: t.join()

    ok = [s for s, _ in results if s in (200, 201)]
    elapsed = time.time() - start
    log(len(ok) == n, f"{n}/{n} créées en {elapsed:.1f}s",
        f"{len(ok)} OK, {n - len(ok)} erreurs")
    if len(ok) == n:
        refs = [b["reservation"]["reference"] for s, b in results if s in (200, 201)]
        log(len(set(refs)) == n, "100 références uniques (aucun doublon)",
            f"{len(refs)} réf, {len(set(refs))} uniques")
    else:
        errs = [b for s, b in results if s not in (200, 201)]
        log(False, "Références uniques (non testé — échecs)", str(errs[:3]))


# ─── Main ───

def main():
    print("=" * 60)
    print("  La Marquise — Tests d'intégration API")
    print(f"  Cible : {BASE}")
    print("=" * 60)

    # Vérification du serveur
    status, body = request("GET", "/health")
    if status != 200:
        print("\n✗ BACKEND INJOIGNABLE !")
        print("  Lance d'abord le backend : cd backend && .venv\\Scripts\\python -m uvicorn app.main:app --reload")
        sys.exit(1)
    print("\n✓ Backend joignable sur", BASE)

    test_health()
    token = test_auth()
    if not token:
        print("\n  Les tests suivants nécessitent un token.")
    else:
        test_menu(token)
        test_gallery(token)
        test_reservations(token)
        test_events(token)
        test_orders(token)
        test_stats(token)
        test_replies(token)
        test_users(token)
        test_concurrency(token)

    # Bilan
    print("\n" + "=" * 60)
    print(f"  RÉSULTAT : {PASSED} ✓ / {FAILED} ✗")
    if FAILURES:
        print("\n  Échecs :")
        for f in FAILURES:
            print(f"    - {f}")
    else:
        print("\n  ✅ TOUS LES TESTS PASSENT !")
    print("=" * 60)
    return 1 if FAILED else 0


if __name__ == "__main__":
    sys.exit(main())
