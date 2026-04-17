#!/bin/bash

# Rediriger stderr vers stdout pour éviter que execute_command échoue à cause d'une sortie sur stderr
exec 2>&1

set -euo pipefail

# Récupérer le répertoire du script (.zscripts)
# Utiliser $0 pour récupérer le chemin du script (compatible sh et bash)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Chemin du projet Next.js
NEXTJS_PROJECT_DIR="$PROJECT_DIR"

# Vérifier que le répertoire du projet Next.js existe
if [ ! -d "$NEXTJS_PROJECT_DIR" ]; then
    echo "❌ Erreur: Le répertoire du projet Next.js n'existe pas: $NEXTJS_PROJECT_DIR"
    exit 1
fi

echo "🚀 Démarrage de la construction de l'application Next.js et des mini-services..."
echo "📁 Chemin du projet Next.js: $NEXTJS_PROJECT_DIR"

# Se placer dans le répertoire du projet Next.js
cd "$NEXTJS_PROJECT_DIR" || exit 1

# Définir les variables d'environnement
export NEXT_TELEMETRY_DISABLED=1

BUILD_SUFFIX="${BUILD_ID:-$(date +%Y%m%d%H%M%S)}"
BUILD_DIR="${TMPDIR:-/tmp}/build_fullstack_$BUILD_SUFFIX"
export BUILD_DIR
echo "📁 Nettoyage et création du répertoire de build: $BUILD_DIR"
mkdir -p "$BUILD_DIR"

if ! command -v bun >/dev/null 2>&1; then
    echo "❌ bun n'est pas installé ou n'est pas disponible dans PATH"
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
bun install

# Construire l'application Next.js
echo "🔨 Construction de l'application Next.js..."
bun run build

# Construire les mini-services
# Vérifier si le répertoire mini-services existe dans le projet Next.js
if [ -d "$NEXTJS_PROJECT_DIR/mini-services" ]; then
    echo "🔨 Construction des mini-services..."
    # Utiliser les scripts mini-services du projet
    sh "$SCRIPT_DIR/mini-services-install.sh"
    sh "$SCRIPT_DIR/mini-services-build.sh"

    # Copier mini-services-start.sh dans le répertoire mini-services-dist
    echo "  - 复制 mini-services-start.sh 到 $BUILD_DIR"
    cp "$SCRIPT_DIR/mini-services-start.sh" "$BUILD_DIR/mini-services-start.sh"
    chmod +x "$BUILD_DIR/mini-services-start.sh"
else
    echo "ℹ️  mini-services 目录不存在，跳过"
fi

# Copier tous les artefacts de build dans le répertoire de build temporaire
echo "📦 Collecte des artefacts de build dans $BUILD_DIR..."

# Copier la sortie standalone de build Next.js
if [ -d ".next/standalone" ]; then
    echo "  - 复制 .next/standalone"
    mkdir -p "$BUILD_DIR/next-service-dist"
    cp -r .next/standalone/. "$BUILD_DIR/next-service-dist/"
fi

# Copier les fichiers statiques Next.js
if [ -d ".next/static" ]; then
    echo "  - 复制 .next/static"
    mkdir -p "$BUILD_DIR/next-service-dist/.next"
    cp -r .next/static "$BUILD_DIR/next-service-dist/.next/"
fi

# Copier le répertoire public
if [ -d "public" ]; then
    echo "  - 复制 public"
    cp -r public "$BUILD_DIR/next-service-dist/"
fi

# Signaler si DATABASE_URL n'est pas prêt pour l'exécution
if [ -z "${DATABASE_URL:-}" ]; then
    echo "ℹ️  DATABASE_URL n'est pas défini pendant le build"
    echo "   L'application devra recevoir une URL PostgreSQL valide au démarrage"
elif printf '%s' "$DATABASE_URL" | grep -q '^file:'; then
    echo "⚠️  DATABASE_URL pointe vers SQLite alors que Prisma est configuré en PostgreSQL"
    echo "   Le build continue, mais l'exécution nécessitera une URL PostgreSQL valide"
fi

# Copier le Caddyfile (s'il existe)
if [ -f "Caddyfile" ]; then
    echo "  - 复制 Caddyfile"
    cp Caddyfile "$BUILD_DIR/"
else
    echo "ℹ️  Caddyfile 不存在，跳过"
fi

# Copier le script start.sh
echo "  - 复制 start.sh 到 $BUILD_DIR"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

# Créer l'archive dans $BUILD_DIR.tar.gz
PACKAGE_FILE="${BUILD_DIR}.tar.gz"
echo ""
echo "📦 Empaquetage des artefacts de build dans $PACKAGE_FILE..."
cd "$BUILD_DIR" || exit 1
tar -czf "$PACKAGE_FILE" .
cd - > /dev/null || exit 1

# # Nettoyer le répertoire temporaire
# rm -rf "$BUILD_DIR"

echo ""
echo "✅ Construction terminée ! Tous les artefacts ont été empaquetés dans $PACKAGE_FILE"
echo "📊 打包文件大小:"
ls -lh "$PACKAGE_FILE"
