#!/bin/bash

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$PROJECT_DIR/mini-services"

main() {
    echo "🚀 Démarrage de l'installation groupée des dépendances..."
    
    if ! command -v bun >/dev/null 2>&1; then
        echo "❌ bun n'est pas installé ou n'est pas disponible dans PATH"
        exit 1
    fi
    
    # Vérifier que ROOT_DIR existe
    if [ ! -d "$ROOT_DIR" ]; then
        echo "ℹ️  Le répertoire $ROOT_DIR n'existe pas, installation ignorée"
        return
    fi
    
    # Variables de comptage
    success_count=0
    fail_count=0
    failed_projects=""
    
    # Parcourir tous les dossiers du répertoire mini-services
    for dir in "$ROOT_DIR"/*; do
        # Vérifier qu'il s'agit d'un dossier contenant package.json
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            project_name=$(basename "$dir")
            echo ""
            echo "📦 Installation des dépendances: $project_name..."
            
            # Entrer dans le répertoire du projet et exécuter bun install
            if (cd "$dir" && bun install); then
                echo "✅ Dépendances de $project_name installées avec succès"
                success_count=$((success_count + 1))
            else
                echo "❌ Échec de l'installation des dépendances de $project_name"
                fail_count=$((fail_count + 1))
                if [ -z "$failed_projects" ]; then
                    failed_projects="$project_name"
                else
                    failed_projects="$failed_projects $project_name"
                fi
            fi
        fi
    done
    
    # Récapitulatif des résultats
    echo ""
    echo "=================================================="
    if [ $success_count -gt 0 ] || [ $fail_count -gt 0 ]; then
        echo "🎉 Installation terminée !"
        echo "✅ Réussi: $success_count projets"
        if [ $fail_count -gt 0 ]; then
            echo "❌ Échoué: $fail_count projets"
            echo ""
            echo "Projets échoués:"
            for project in $failed_projects; do
                echo "  - $project"
            done
        fi
    else
        echo "ℹ️  Aucun projet contenant package.json trouvé"
    fi
    echo "=================================================="
}

main
