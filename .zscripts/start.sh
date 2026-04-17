#!/bin/sh

set -e

# Récupérer le répertoire du script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR"
cleanup_ran=0

# Stocker les PID de tous les processus enfants
pids=""

# Fonction de nettoyage : arrêter proprement tous les services
cleanup() {
    if [ "$cleanup_ran" -eq 1 ]; then
        return
    fi
    cleanup_ran=1

    echo ""
    echo "🛑 Fermeture de tous les services..."
    
    # Envoyer le signal SIGTERM à tous les processus enfants
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            service_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
            echo "   Fermeture du processus $pid ($service_name)..."
            kill -TERM "$pid" 2>/dev/null
        fi
    done
    
    # Attendre que tous les processus se terminent (5 secondes maximum)
    sleep 1
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            # S'il tourne encore, attendre jusqu'à 4 secondes
            timeout=4
            while [ $timeout -gt 0 ] && kill -0 "$pid" 2>/dev/null; do
                sleep 1
                timeout=$((timeout - 1))
            done
            # S'il tourne toujours, forcer l'arrêt
            if kill -0 "$pid" 2>/dev/null; then
                echo "   Fermeture forcée du processus $pid..."
                kill -KILL "$pid" 2>/dev/null
            fi
        fi
    done
    
    echo "✅ Tous les services ont été fermés"
}

trap cleanup EXIT INT TERM

echo "🚀 Démarrage de tous les services..."
echo ""

# Se placer dans le répertoire de build
cd "$BUILD_DIR" || exit 1

ls -lah

if ! command -v bun >/dev/null 2>&1; then
    echo "❌ bun n'est pas installé ou n'est pas disponible dans PATH"
    exit 1
fi

# Démarrer le serveur Next.js
if [ -f "./next-service-dist/server.js" ]; then
    echo "🚀 Démarrage du serveur Next.js..."
    cd next-service-dist/ || exit 1
    
    # Définir les variables d'environnement
    export NODE_ENV=production
    export PORT="${PORT:-3000}"
    export HOSTNAME="${HOSTNAME:-0.0.0.0}"

    if [ -z "${DATABASE_URL:-}" ]; then
        echo "❌ DATABASE_URL n'est pas défini"
        echo "   Configure une URL PostgreSQL valide avant de démarrer l'application"
        exit 1
    fi

    if printf '%s' "$DATABASE_URL" | grep -q '^file:'; then
        echo "❌ DATABASE_URL pointe vers SQLite, mais Prisma est configuré en PostgreSQL"
        echo "   Configure une URL PostgreSQL valide avant de démarrer l'application"
        exit 1
    fi

    echo "🗄️  Connexion PostgreSQL externe détectée"
    
    # Démarrer Next.js en arrière-plan
    bun server.js &
    NEXT_PID=$!
    pids="$NEXT_PID"
    
    # Attendre un court instant pour vérifier que le processus a bien démarré
    sleep 1
    if ! kill -0 "$NEXT_PID" 2>/dev/null; then
        echo "❌ Échec du démarrage du serveur Next.js"
        exit 1
    else
        echo "✅ Serveur Next.js démarré (PID: $NEXT_PID, Port: $PORT)"
    fi
    
    cd ../
else
    echo "⚠️  Fichier serveur Next.js introuvable: ./next-service-dist/server.js"
fi

# Démarrer les mini-services
if [ -f "./mini-services-start.sh" ]; then
    echo "🚀 Démarrage des mini-services..."
    
    # Exécuter le script de démarrage (depuis la racine ; le script gère lui-même le répertoire mini-services-dist)
    sh ./mini-services-start.sh &
    MINI_PID=$!
    pids="$pids $MINI_PID"
    
    # Attendre un court instant pour vérifier que le processus a bien démarré
    sleep 1
    if ! kill -0 "$MINI_PID" 2>/dev/null; then
        echo "⚠️  Le démarrage des mini-services a peut-être échoué, mais continuation..."
    else
        echo "✅ Mini-services démarrés (PID: $MINI_PID)"
    fi
elif [ -d "./mini-services-dist" ]; then
    echo "⚠️  Script de démarrage des mini-services introuvable, mais répertoire présent"
else
    echo "ℹ️  Répertoire mini-services inexistant, ignoré"
fi

echo ""
echo "🎉 Tous les services ont été démarrés !"
echo ""
echo "💡 Appuyez sur Ctrl+C pour arrêter tous les services"
echo ""

if [ -f "./Caddyfile" ]; then
    if command -v caddy >/dev/null 2>&1; then
        echo "🚀 Démarrage de Caddy..."
        echo "✅ Caddy démarré (exécution en avant-plan)"
        exec caddy run --config Caddyfile --adapter caddyfile
    fi

    echo "⚠️  Caddyfile présent, mais commande caddy introuvable"
fi

echo "ℹ️  Aucun proxy Caddy démarré, attente des processus applicatifs..."
if [ -n "${NEXT_PID:-}" ]; then
    wait "$NEXT_PID"
elif [ -n "${MINI_PID:-}" ]; then
    wait "$MINI_PID"
else
    echo "ℹ️  Aucun processus applicatif à maintenir au premier plan"
fi
