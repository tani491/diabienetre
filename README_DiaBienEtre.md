# DiaBienEtre - E-Commerce Beauté & Bien-Être

> Plateforme e-commerce sénégalaise spécialisée dans la vente de produits capillaires et de soins de la peau 100% naturels.

---

## 📋 Sommaire

1. [Présentation du Projet](#-présentation-du-projet)
2. [Stack Technique](#-stack-technique)
3. [Structure du Projet](#-structure-du-projet)
4. [Fonctionnalités](#-fonctionnalités)
5. [Processus de Commande](#-processus-de-commande)
6. [Administration](#-administration)
7. [Base de Données](#-base-de-données)
8. [API Routes](#-api-routes)
9. [Installation & Déploiement](#-installation--déploiement)
10. [Variables d'Environnement](#-variables-denvironnement)
11. [Identifiants & Accès](#-identifiants--accès)

---

## 🌟 Présentation du Projet

**DiaBienEtre** est une application web e-commerce moderne conçue pour le marché sénégalais. Elle permet aux clients de parcourir un catalogue de produits de beauté naturels (soins capillaires et soins de la peau), de les ajouter à un panier, et de passer commande via deux modes de paiement : **WhatsApp** ou **Wave**.

Le site est entièrement responsive, optimisé pour mobile, et propose une expérience utilisateur fluide avec des animations soignées via Framer Motion. L'interface utilise une palette de couleurs naturelle (sage green, doré) pour refléter l'identité de la marque.

---

## 🛠 Stack Technique

| Technologie | Utilisation |
|---|---|
| **Next.js 16** (App Router) | Framework React full-stack avec rendu serveur et client |
| **TypeScript** | Typage statique pour la fiabilité du code |
| **Tailwind CSS 4** | Framework CSS utilitaire pour le design responsive |
| **shadcn/ui** | Composants UI accessibles et personnalisables |
| **Lucide React** | Bibliothèque d'icônes SVG |
| **Framer Motion** | Animations fluides et transitions de pages |
| **Zustand** (persist) | Gestion d'état client (panier, navigation) avec persistance localStorage |
| **Prisma ORM** | ORM pour interagir avec la base de données |
| **SQLite** | Base de données légère pour le développement |
| **NextAuth.js** | Authentification sécurisée pour l'administration |
| **bcryptjs** | Hashage sécurisé des mots de passe |
| **Sonner** | Notifications toast élégantes |

---

## 📁 Structure du Projet

```
diabienetre/
├── prisma/
│   ├── schema.prisma          # Schéma de la base de données
│   └── seed.ts                # Données initiales (produits + admin)
├── public/
│   ├── logo.png               # Logo DiaBienEtre
│   ├── logo.svg               # Logo SVG
│   ├── hero-image.png         # Image bannière principale
│   ├── product-hair-1~4.png   # Images produits cheveux
│   └── product-skin-1~4.png   # Images produits peau
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout racine avec Providers + Toaster
│   │   ├── page.tsx           # Page SPA principale (routing client-side)
│   │   ├── globals.css        # Styles globaux + thème Tailwind
│   │   ├── admin/
│   │   │   ├── page.tsx       # Tableau de bord admin (protégé par middleware)
│   │   │   ├── AdminDashboard.tsx  # Composant dashboard admin
│   │   │   └── login/
│   │   │       ├── page.tsx        # Page de connexion admin
│   │   │       └── AdminLoginPage.tsx  # Composant formulaire login
│   │   └── api/
│   │       ├── products/route.ts        # GET tous les produits publics
│   │       ├── orders/route.ts          # POST commande / GET commandes (admin)
│   │       ├── admin/products/route.ts  # CRUD produits (admin)
│   │       └── auth/[...nextauth]/route.ts  # API NextAuth.js
│   ├── components/
│   │   ├── Header.tsx           # Navigation (desktop + mobile)
│   │   ├── Hero.tsx             # Section héro de la page d'accueil
│   │   ├── Categories.tsx       # Grille des catégories (Cheveux/Peau)
│   │   ├── FeaturedProducts.tsx # Produits vedettes en carousel
│   │   ├── Catalog.tsx          # Catalogue complet avec filtres
│   │   ├── ProductCard.tsx      # Carte produit individuelle
│   │   ├── Cart.tsx             # Page panier avec quantités
│   │   ├── Checkout.tsx         # Processus de commande en 3 étapes
│   │   ├── OrderConfirmation.tsx # Page de confirmation de commande
│   │   ├── Footer.tsx           # Pied de page
│   │   ├── Providers.tsx        # Provider NextAuth.js SessionProvider
│   │   └── ui/                  # Composants shadcn/ui
│   ├── lib/
│   │   ├── store.ts             # Store Zustand (panier, navigation, commande)
│   │   ├── auth.ts              # Configuration NextAuth.js
│   │   ├── db.ts                # Client Prisma (Singleton)
│   │   └── utils.ts             # Fonctions utilitaires (cn, etc.)
│   └── hooks/
│       ├── use-toast.ts         # Hook de notification toast
│       └── use-mobile.ts        # Hook de détection mobile
├── middleware.ts                # Middleware de protection des routes /admin
├── tailwind.config.ts           # Configuration Tailwind (couleurs sage, gold)
├── next.config.ts               # Configuration Next.js
├── package.json                 # Dépendances et scripts
└── .env                         # Variables d'environnement
```

---

## ✅ Fonctionnalités

### Côté Client (Public)

- **Page d'accueil** : Section héro avec CTA, catégories visuelles, produits vedettes en carousel
- **Catalogue** : Affichage de tous les produits avec filtres par catégorie (Cheveux / Peau), grille responsive
- **Fiche produit** : Vue détaillée dans un modal avec description, prix, bouton d'ajout au panier
- **Panier** : Gestion des quantités (+/-), suppression d'articles, calcul automatique du total, badge compteur dans le header
- **Checkout en 3 étapes** : Voir section dédiée ci-dessous
- **Confirmation de commande** : Récapitulatif avec statut et mode de paiement utilisé
- **Design responsive** : Optimisé mobile, tablette et desktop avec menu hamburger sur mobile
- **Animations** : Transitions fluides entre les pages, animations d'apparition, micro-interactions
- **Persistance du panier** : Le panier est sauvegardé en localStorage et persiste entre les sessions

### Côté Administration

- **Authentification sécurisée** : Page de login dédiée avec email/mot de passe via NextAuth.js
- **Middleware de protection** : Toutes les routes `/admin/*` sont protégées, redirection automatique vers le login si non authentifié
- **Tableau de bord** : Statistiques en temps réel (produits, vedettes, commandes, en attente, WhatsApp)
- **Gestion des produits (CRUD)** : Créer, modifier, supprimer des produits via une interface intuitive
- **Gestion des commandes** : Liste de toutes les commandes avec statut (En attente, WhatsApp, Confirmée, Expédiée, Livrée)
- **Déconnexion sécurisée** : Bouton de déconnexion avec redirection vers l'accueil

---

## 🛒 Processus de Commande

Le processus de commande se déroule en **3 étapes** guidées par un stepper visuel :

### Étape 1 — Informations du Client

Le client remplit ses coordonnées de livraison :
- Nom complet (obligatoire)
- Numéro de téléphone (obligatoire)
- Adresse de livraison (obligatoire)

Une validation est effectuée avant de passer à l'étape suivante.

### Étape 2 — Récapitulatif de la Commande

Le client vérifie le détail de sa commande :
- Liste des produits avec images, noms, quantités et sous-totaux
- Montant total en FCFA
- Coordonnées du client récapitulées
- Possibilité de revenir en arrière pour modifier les informations

### Étape 3 — Choix du Mode de Paiement

Le client a **2 options** de paiement :

#### Option A : Commander via WhatsApp 💬
- Un message pré-rempli est généré automatiquement avec tous les détails de la commande (produits, quantités, prix, coordonnées)
- Le client est redirigé vers WhatsApp au numéro **775278596**
- La commande est enregistrée en base avec le statut `whatsapp_pending`
- Un message indique que le paiement peut se faire à la livraison (espèces ou Wave)

#### Option B : Payer via Wave 💳
- Le numéro Wave **775278596** et le montant à envoyer sont affichés
- Le client effectue le transfert sur son application Wave
- Le client saisit la **référence de transaction Wave** (trouvée dans l'historique Wave)
- La commande est enregistrée avec le statut `pending` et la référence Wave
- Un administrateur vérifiera manuellement la référence de transaction

### Après la Commande

- Une page de confirmation s'affiche avec le statut et le mode de paiement utilisé
- Pour les commandes WhatsApp, un conseil de paiement à la livraison est affiché
- Le panier est automatiquement vidé
- Le client peut retourner à l'accueil

---

## 🔐 Administration

### Accès

- **URL** : `/admin` (accessible uniquement par cette URL, pas de lien public)
- **Page de login** : `/admin/login`
- **Protection** : Middleware Next.js qui intercepte toutes les requêtes `/admin/*`

### Authentification

Le système utilise **NextAuth.js** avec :
- **Stratégie** : Credentials (email + mot de passe)
- **Session** : JWT avec une durée de 30 jours
- **Vérification** : Le mot de passe est comparé avec un hash bcrypt stocké en base
- **Rôle** : Seuls les utilisateurs avec le rôle `admin` peuvent se connecter

### Fonctionnalités du Dashboard

| Fonctionnalité | Description |
|---|---|
| Statistiques | Compteurs de produits, vedettes, commandes totales, commandes WhatsApp et en attente |
| Onglet Produits | Tableau avec image, nom, prix, catégorie, stock, vedette + boutons modifier/supprimer |
| Onglet Commandes | Tableau avec client, téléphone, montant, référence Wave, statut, date |
| Nouveau produit | Formulaire modal avec nom, description, prix, stock, image, catégorie, vedette |
| Déconnexion | Bouton de déconnexion avec redirection vers l'accueil public |

---

## 🗄 Base de Données

### Schéma Prisma

Le schéma comprend 3 modèles principaux :

#### User (Utilisateur)
| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| email | String (unique) | Adresse email |
| name | String? | Nom complet |
| password | String? | Mot de passe hashé (bcrypt) |
| role | String | Rôle : `admin` ou `customer` |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de modification |

#### Product (Produit)
| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| name | String | Nom du produit |
| description | String | Description détaillée |
| price | Float | Prix en FCFA |
| image | String | Chemin de l'image |
| category | String | `cheveux` ou `peau` |
| stock | Int | Quantité en stock |
| featured | Boolean | Produit vedette (affiché en carousel) |
| active | Boolean | Produit actif (visible dans le catalogue) |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de modification |

#### Order (Commande)
| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| customerName | String | Nom du client |
| customerPhone | String | Téléphone du client |
| customerAddress | String | Adresse de livraison |
| items | String | JSON des articles commandés |
| totalAmount | Float | Montant total en FCFA |
| waveRef | String? | Référence de transaction Wave |
| status | String | `pending`, `whatsapp_pending`, `confirmed`, `shipped`, `delivered` |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de modification |

### Données Initiales (Seed)

Le script `prisma/seed.ts` initialise la base avec :
- **8 produits** (4 cheveux + 4 peau) avec descriptions détaillées
- **1 utilisateur admin** avec mot de passe hashé

---

## 📡 API Routes

### Produits (Public)

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/products` | Récupère tous les produits actifs |

### Commandes

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/orders` | Crée une nouvelle commande (client) |
| `GET` | `/api/orders` | Récupère toutes les commandes (admin, Bearer token requis) |

#### POST /api/orders — Corps de la requête

```json
{
  "customerName": "Fatou Diallo",
  "customerPhone": "77 123 45 67",
  "customerAddress": "Medina, Dakar",
  "items": [
    {
      "id": "abc123",
      "name": "Huile de Argan Précieuse",
      "price": 15000,
      "image": "/product-hair-1.png",
      "quantity": 2,
      "category": "cheveux"
    }
  ],
  "totalAmount": 30000,
  "paymentMethod": "wave",
  "waveRef": "WV20240115001"
}
```

Pour une commande WhatsApp, `paymentMethod` vaut `"whatsapp"` et `waveRef` est omis.

### Produits Admin (Protégé)

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/admin/products` | Crée un nouveau produit |
| `PUT` | `/api/admin/products` | Modifie un produit existant |
| `DELETE` | `/api/admin/products?id=xxx` | Supprime un produit |

> **Note** : Les routes admin nécessitent le header `Authorization: Bearer admin-diabienetre`.

---

## 🚀 Installation & Déploiement

### Prérequis

- Node.js 18+ ou Bun
- Git

### Installation

```bash
# Cloner le projet
git clone <url-du-repo>
cd diabienetre

# Installer les dépendances
npm install
# ou
bun install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir les valeurs dans .env

# Initialiser la base de données
npx prisma db push
npx prisma generate

# Peupler la base de données
npm run db:seed
# ou
bun run db:seed
```

### Développement

```bash
npm run dev
# Le serveur démarre sur http://localhost:3000
```

### Production

```bash
npm run build
npm run start
```

---

## 🔑 Variables d'Environnement

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URL de connexion à la base de données | `file:./db/custom.db` |
| `NEXTAUTH_SECRET` | Clé secrète pour les sessions JWT | Une chaîne aléatoire sécurisée |
| `NEXTAUTH_URL` | URL de base de l'application | `http://localhost:3000` |
| `ADMIN_EMAIL` | Email de l'administrateur autorisé | `admin@diabienetre.sn` |

---

## 🔑 Identifiants & Accès

### Administration

| Information | Valeur |
|---|---|
| **URL Admin** | `/admin` |
| **URL Login** | `/admin/login` |
| **Email Admin** | `admin@diabienetre.sn` |
| **Mot de passe Admin** | `admin2024` |

### Paiement

| Information | Valeur |
|---|---|
| **Numéro Wave** | `775278596` |
| **Numéro WhatsApp** | `+221 77 527 85 96` |
| **Devise** | FCFA (Franc CFA) |

### Contact

| Information | Valeur |
|---|---|
| **Email** | `contact@diabienetre.sn` |
| **Localisation** | Dakar, Sénégal |

### API Admin Token

| Information | Valeur |
|---|---|
| **Authorization Header** | `Bearer admin-diabienetre` |
| **Utilisation** | Routes `/api/orders` (GET) et `/api/admin/products` (CRUD) |

---

## 📝 Notes Importantes

### Sécurité
- L'administration n'est accessible que via l'URL `/admin` — aucun lien public n'existe
- Le middleware Next.js protège toutes les routes `/admin/*`
- Les sessions JWT expirent après 30 jours
- Les mots de passe sont hashés avec bcrypt (salt rounds: 12)

### Processus de Commande WhatsApp
- Le message WhatsApp est généré automatiquement avec un format structuré
- Le numéro WhatsApp utilisé est le même que le numéro Wave
- Le statut `whatsapp_pending` permet de distinguer ces commandes dans le dashboard admin
- Le client est informé qu'il peut payer à la livraison

### Base de Données
- SQLite est utilisé pour le développement (base fichier dans `db/custom.db`)
- Pour la production, il est recommandé de migrer vers PostgreSQL en modifiant le provider dans `schema.prisma`
- Le script de seed peut être relancé avec `npm run db:seed` (les données existantes sont supprimées)

### Navigation SPA
- L'application utilise un pattern SPA avec Zustand pour la navigation client-side
- Les pages sont gérées par un état `currentPage` dans le store
- Seule l'administration utilise le routage Next.js classique (`/admin`, `/admin/login`)
