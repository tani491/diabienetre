#!/bin/sh

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="${DIST_DIR:-$SCRIPT_DIR/mini-services-dist}"
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

main() {
    echo "🚀 Démarrage de tous les mini-services..."
    
    if ! command -v bun >/dev/null 2>&1; then
        echo "❌ bun n'est pas installé ou n'est pas disponible dans PATH"
        exit 1
    fi
    
    # Vérifier que le répertoire dist existe
    if [ ! -d "$DIST_DIR" ]; then
        echo "ℹ️  Le répertoire $DIST_DIR n'existe pas"
        return
    fi
    
    # Rechercher tous les fichiers mini-service-*.js
    service_files=""
    for file in "$DIST_DIR"/mini-service-*.js; do
        if [ -f "$file" ]; then
            if [ -z "$service_files" ]; then
                service_files="$file"
            else
                service_files="$service_files $file"
            fi
        fi
    done
    
    # Compter le nombre de fichiers de service
    service_count=0
    for file in $service_files; do
        service_count=$((service_count + 1))
    done
    
    if [ $service_count -eq 0 ]; then
        echo "ℹ️  Aucun fichier de mini-service trouvé"
        return
    fi
    
    echo "📦 $service_count services trouvés, démarrage en cours..."
    echo ""
    
    # Démarrer chaque service
    for file in $service_files; do
        service_name=$(basename "$file" .js | sed 's/mini-service-//')
        echo "▶️  Démarrage du service: $service_name..."
        
        # Exécuter le service avec bun (en arrière-plan)
        bun "$file" &
        pid=$!
        if [ -z "$pids" ]; then
            pids="$pid"
        else
            pids="$pids $pid"
        fi
        
        # Attendre un court instant pour vérifier que le processus a bien démarré
        sleep 0.5
        if ! kill -0 "$pid" 2>/dev/null; then
            echo "❌ Échec du démarrage de $service_name"
            # Retirer le PID en échec de la chaîne
            pids=$(echo "$pids" | sed "s/\b$pid\b//" | sed 's/  */ /g' | sed 's/^ *//' | sed 's/ *$//')
        else
            echo "✅ $service_name démarré (PID: $pid)"
        fi
    done
    
    # Compter le nombre de services en cours d'exécution
    running_count=0
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            running_count=$((running_count + 1))
        fi
    done
    
    echo ""
    echo "🎉 Tous les services ont été démarrés ! Total $running_count services en cours d'exécution"
    echo ""
    echo "💡 Appuyez sur Ctrl+C pour arrêter tous les services"
    echo ""
    
    # Attendre tous les processus en arrière-plan
    wait
}

main
