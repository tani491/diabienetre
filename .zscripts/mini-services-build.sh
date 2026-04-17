#!/bin/bash

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$PROJECT_DIR/mini-services"
BUILD_SUFFIX="${BUILD_ID:-$(date +%Y%m%d%H%M%S)}"
DIST_DIR="${BUILD_DIR:-${TMPDIR:-/tmp}/build_fullstack_$BUILD_SUFFIX}/mini-services-dist"

main() {
    echo "🚀 Démarrage de la construction groupée..."
    
    if ! command -v bun >/dev/null 2>&1; then
        echo "❌ bun n'est pas installé ou n'est pas disponible dans PATH"
        exit 1
    fi
    
    # Vérifier que ROOT_DIR existe
    if [ ! -d "$ROOT_DIR" ]; then
        echo "ℹ️  Le répertoire $ROOT_DIR n'existe pas, construction ignorée"
        return
    fi
    
    # Créer le répertoire de sortie (s'il n'existe pas)
    mkdir -p "$DIST_DIR"
    
    # Variables de comptage
    success_count=0
    fail_count=0
    
    # Parcourir tous les dossiers du répertoire mini-services
    for dir in "$ROOT_DIR"/*; do
        # Vérifier qu'il s'agit d'un dossier contenant package.json
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            project_name=$(basename "$dir")
            
            # Rechercher intelligemment le fichier d'entrée (selon l'ordre de priorité)
            entry_path=""
            for entry in "src/index.ts" "index.ts" "src/index.js" "index.js"; do
                if [ -f "$dir/$entry" ]; then
                    entry_path="$dir/$entry"
                    break
                fi
            done
            
            if [ -z "$entry_path" ]; then
                echo "⚠️  Ignoré $project_name: aucun fichier d'entrée trouvé (index.ts/js)"
                continue
            fi
            
            echo ""
            echo "📦 Construction en cours: $project_name..."
            
            # Construire avec la CLI `bun build`
            output_file="$DIST_DIR/mini-service-$project_name.js"
            
            if bun build "$entry_path" \
                --outfile "$output_file" \
                --target bun \
                --minify; then
                echo "✅ $project_name construit avec succès -> $output_file"
                success_count=$((success_count + 1))
            else
                echo "❌ Échec de construction de $project_name"
                fail_count=$((fail_count + 1))
            fi
        fi
    done
    
    if [ -f "$SCRIPT_DIR/mini-services-start.sh" ]; then
        cp "$SCRIPT_DIR/mini-services-start.sh" "$DIST_DIR/mini-services-start.sh"
        chmod +x "$DIST_DIR/mini-services-start.sh"
    fi
    
    echo ""
    echo "🎉 Toutes les tâches sont terminées !"
    if [ $success_count -gt 0 ] || [ $fail_count -gt 0 ]; then
        echo "✅ Réussi: $success_count projets"
        if [ $fail_count -gt 0 ]; then
            echo "❌ Échoué: $fail_count projets"
        fi
    fi
}

main
