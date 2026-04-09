# DiaBienEtre - Documentation Complète

## Présentation

**DiaBienEtre** est une boutique en ligne spécialisée dans les produits capillaires et les soins de la peau (skin care) 100 % naturels. Conçue pour le marché sénégalais, la plateforme offre une expérience d'achat fluide, élégante et mobile-friendly avec un paiement intégré via Wave.

---

## Fonctionnalités du site (Côté Client)

### 1. Page d'accueil
- Section Hero plein écran avec image de fond et animations d'entrée (Framer Motion)
- Slogan : "Votre Bien-Être, Notre Priorité"
- Badge "100% Naturel" avec icône dorée
- Deux boutons d'appel à l'action : "Découvrir nos produits" et "Nos Catégories"
- Section catégories : deux cartes interactives (Cheveux / Peau) qui filtrent le catalogue
- Section produits phares : carrousel automatique des produits marqués comme "vedette"

### 2. Catalogue
- Grille responsive de produits (2 colonnes mobile, 3 tablette, 4 desktop)
- Barre de recherche par nom ou description de produit
- Filtres par catégorie : Tous / Cheveux / Peau
- Compteur de produits affichés
- Cartes produit avec : image, nom, prix en CFA, badge "Vedette" si applicable, bouton "Ajouter au panier"
- Animation d'ajout au panier (toast notification Sonner)

### 3. Panier d'achat
- Liste des articles avec image, nom, catégorie, prix unitaire
- Contrôles de quantité (+/-) avec suppression automatique à 0
- Bouton de suppression individuel par article
- Résumé de commande en sidebar (sticky sur desktop) avec :
  - Détail de chaque ligne (nom × quantité = sous-total)
  - Total général
  - Bouton "Passer la commande" doré
- État vide avec illustration et lien vers le catalogue
- Persistance du panier dans le navigateur (localStorage via Zustand)

### 4. Processus de commande (Checkout)
Formulaire en 3 étapes avec indicateur de progression visuel :

- **Étape 1 - Informations** : Nom complet, Téléphone, Adresse de livraison (champs obligatoires avec validation)
- **Étape 2 - Récapitulatif** : Résumé des articles commandés, sous-total, total, informations client
- **Étape 3 - Paiement Wave** :
  - Affichage du montant à envoyer
  - Numéro Wave destinataire : **775278596**
  - Champ pour saisir la référence de la transaction Wave
  - Bouton "Confirmer le paiement"

### 5. Page de confirmation
- Animation de succès
- Récapitulatif de la commande validée
- Bouton "Retour à l'accueil"

### 6. Navigation et design
- Header sticky avec effet glassmorphism au scroll (sage green)
- Logo DiaBienEtre avec image
- Menu desktop : Accueil, Catalogue + icône Panier avec badge compteur
- Menu mobile (hamburger) dans un sheet latéral avec même navigation
- Footer 4 colonnes : Marque, Navigation, Nos Produits, Contact
- Thème zen : vert sauge, or, crème
- Animations fluides entre toutes les pages (Framer Motion AnimatePresence)

---

## Fonctionnalités Admin (Côté Gestionnaire)

### Accès à l'administration
L'admin est **masqué de la navigation publique**. Deux méthodes d'accès :

1. **URL secrète** : Ajouter `?admin=true` à l'adresse du site
   - Exemple : `https://votresite.com/?admin=true`
   - L'URL se nettoie automatiquement après la redirection (l'URL redevient `/`)

2. **Lien discret dans le footer** : Un petit point (`●`) quasi invisible en bas à droite du footer, à côté de "Fait avec ♥ au Sénégal"

### Authentification
- Page de connexion avec champ mot de passe
- Mot de passe admin : **`admin2024`**
- Possibilité d'afficher/masquer le mot de passe (icône œil)

### Tableau de bord
Statistiques en haut de page :
- Nombre total de produits
- Nombre de produits vedettes
- Nombre total de commandes
- Nombre de commandes en attente (en doré)

### Gestion des produits (Onglet "Produits")
- Tableau avec colonnes : Produit (image + nom), Prix, Catégorie, Stock, Vedette, Actions
- **Ajouter un produit** : bouton "Nouveau produit" qui ouvre un formulaire dialog avec :
  - Nom du produit (obligatoire)
  - Description
  - Prix en CFA (obligatoire)
  - Stock (défaut : 50)
  - URL de l'image (obligatoire, ex : `/product-name.png`)
  - Catégorie : Cheveux / Peau (boutons radio)
  - Produit vedette : toggle on/off
- **Modifier un produit** : bouton crayon qui ouvre le même formulaire pré-rempli
- **Supprimer un produit** : bouton poubelle avec confirmation (soft-delete, le produit devient inactif)

### Gestion des commandes (Onglet "Commandes")
- Tableau avec colonnes : Client, Téléphone, Montant, Référence Wave, Statut, Date
- Badges de statut colorés :
  - `pending` (En attente) : ambre
  - `confirmed` (Confirmée) : vert
  - `shipped` (Expédiée) : gris sage
  - `delivered` (Livrée) : gris sage
- Badge compteur sur l'onglet pour les commandes en attente

---

## Identifiants et mots de passe

| Accès | Identifiant / Valeur |
|---|---|
| **Admin - Mot de passe** | `admin2024` |
| **API Admin - Bearer Token** | `Bearer admin-diabienetre` |
| **Numéro Wave (paiement)** | `775278596` |
| **Email de contact** | `contact@diabienetre.sn` |
| **Localisation** | Dakar, Sénégal |

---

## API Routes

### Produits
| Route | Méthode | Description | Authentification |
|---|---|---|---|
| `/api/products` | GET | Liste tous les produits actifs (filtre optionnel `?category=cheveux` ou `?category=peau`) | Aucune |
| `/api/products` | POST | Crée un nouveau produit | Bearer Token requis |

### Commandes
| Route | Méthode | Description | Authentification |
|---|---|---|---|
| `/api/orders` | POST | Crée une nouvelle commande (nom, téléphone, adresse, articles, total, référence Wave) | Aucune |
| `/api/orders` | GET | Liste toutes les commandes | Bearer Token requis |

### Admin - Produits
| Route | Méthode | Description | Authentification |
|---|---|---|---|
| `/api/admin/products` | PUT | Met à jour un produit (envoyer l'ID + champs à modifier) | Bearer Token requis |
| `/api/admin/products?id=xxx` | DELETE | Supprime un produit (soft-delete, active=false) | Bearer Token requis |

---

## Base de données

### Tables

**Products**
| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| name | String | Nom du produit |
| description | String | Description détaillée |
| price | Float | Prix en CFA |
| image | String | Chemin de l'image (ex : `/product-hair-1.png`) |
| category | String | "cheveux" ou "peau" |
| stock | Int | Quantité en stock |
| featured | Boolean | Produit vedette (affiché sur l'accueil) |
| active | Boolean | Produit actif (visible dans le catalogue) |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de modification |

**Orders**
| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| customerName | String | Nom du client |
| customerPhone | String | Téléphone du client |
| customerAddress | String | Adresse de livraison |
| items | String (JSON) | Articles commandés (sérialisés en JSON) |
| totalAmount | Float | Montant total en CFA |
| waveRef | String | Référence de la transaction Wave |
| status | String | "pending", "confirmed", "shipped", "delivered" |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de modification |

**Users** (réservé pour futures évolutions)
| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| email | String | Adresse email (unique) |
| name | String | Nom complet |
| password | String | Mot de passe hashé |
| role | String | "admin" ou "customer" |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de modification |

---

## Produits chargés en base (Seed Data)

### Produits Capillaires (Cheveux)
| # | Nom | Prix | Vedette |
|---|---|---|---|
| 1 | Huile de Argan Précieuse | 15 000 CFA | Oui |
| 2 | Beurre de Karité Naturel | 8 000 CFA | Non |
| 3 | Masque Réparateur Intense | 12 000 CFA | Oui |
| 4 | Sérum Croissance Capillaire | 10 000 CFA | Non |

### Produits Soins de la Peau
| # | Nom | Prix | Vedette |
|---|---|---|---|
| 1 | Sérum Éclat Vitamine C | 18 000 CFA | Oui |
| 2 | Crème Hydratante Bio | 14 000 CFA | Non |
| 3 | Gommage Corps Naturel | 9 000 CFA | Non |
| 4 | Crème Éclat Doré | 16 000 CFA | Oui |

Tous les produits ont un stock initial de 50 unités.

---

## Stack Technique

| Technologie | Utilisation |
|---|---|
| **Next.js 16** (App Router) | Framework React avec rendu côté serveur |
| **TypeScript 5** | Typage statique |
| **Tailwind CSS 4** | Framework CSS utilitaire |
| **shadcn/ui** | Bibliothèque de composants UI |
| **Lucide React** | Bibliothèque d'icônes |
| **Zustand** | Gestion d'état client (panier, navigation) |
| **Framer Motion** | Animations et transitions |
| **Prisma ORM** | Base de données avec SQLite |
| **Sonner** | Notifications toast |

---

## Structure des fichiers principaux

```
src/
├── app/
│   ├── layout.tsx              # Layout principal (metadata, fonts, Toaster)
│   ├── page.tsx                # Point d'entrée SPA (routeur client-side)
│   ├── globals.css             # Thème wellness (sage green, gold, cream)
│   └── api/
│       ├── products/route.ts   # API produits (GET/POST)
│       ├── orders/route.ts     # API commandes (POST/GET)
│       └── admin/products/route.ts  # API admin produits (PUT/DELETE)
├── components/
│   ├── Header.tsx              # Navigation (logo, menu, panier)
│   ├── Hero.tsx                # Section hero plein écran
│   ├── Categories.tsx          # Cartes catégories (Cheveux/Peau)
│   ├── FeaturedProducts.tsx    # Carrousel produits vedettes
│   ├── ProductCard.tsx         # Carte produit individuelle
│   ├── Catalog.tsx             # Catalogue avec filtres et recherche
│   ├── Cart.tsx                # Panier d'achat
│   ├── Checkout.tsx            # Processus de commande 3 étapes
│   ├── Admin.tsx               # Tableau de bord administration
│   ├── Footer.tsx              # Pied de page
│   └── OrderConfirmation.tsx   # Page de confirmation
├── lib/
│   ├── store.ts                # Store Zustand (panier, navigation, filtres)
│   └── db.ts                   # Client Prisma (base de données)
prisma/
├── schema.prisma               # Schéma de la base de données
└── seed.ts                     # Données initiales (8 produits)
public/
├── logo.png                    # Logo de la marque
├── hero-image.png              # Image hero (1344x768)
├── product-hair-1.png à 4.png  # Images produits cheveux
└── product-skin-1.png à 4.png  # Images produits peau
```

---

## Processus de paiement Wave (Guide client)

1. Le client ajoute des produits au panier et clique sur "Passer la commande"
2. Il remplit ses informations (nom, téléphone, adresse)
3. Il vérifie le récapitulatif de sa commande
4. Il voit le montant exact à envoyer et le numéro Wave : **775278596**
5. Il ouvre son application Wave et effectue le transfert
6. Il copie la référence de la transaction Wave
7. Il colle la référence dans le champ prévu et clique sur "Confirmer le paiement"
8. La commande est enregistrée avec le statut "En attente"
9. L'admin vérifie la réception du paiement et peut changer le statut de la commande

---

## Notes de sécurité

- L'admin est protégé par un mot de passe côté client (à améliorer avec une authentification serveur pour la production)
- Les API sensibles (création/modification/suppression produits, liste des commandes) sont protégées par un Bearer Token
- Le panier persiste dans le localStorage du navigateur
- Les produits supprimés le sont par soft-delete (champ `active=false`), ils restent en base de données
