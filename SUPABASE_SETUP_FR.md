## Guide de configuration Supabase pour DiaBienEtre

Lisez ce guide **ligne par ligne** — chaque détail compte.

---

### 1️⃣ Créer un projet Supabase (gratuit)

1. Allez sur https://supabase.com
2. Créez un compte ou connectez-vous
3. Créez un **New Project**
   - Name: `DiaBienEtre` (ou ce que tu veux)
   - Region: Choisis la région **la plus proche** de tes utilisateurs (ex: Europe si ton app est en Afrique, choisis Africa si disponible)
   - Password: Génère un mot de passe **fort** et **note-le** quelque part ⚠️

**⏳ Attends 2-3 minutes que le projet soit créé...**

---

### 2️⃣ Configurer la base de données PostgreSQL

1. Une fois le projet créé, tu es redirigé vers le **Dashboard Supabase**
2. Clique sur **Settings** (en bas à gauche)
3. Onglet **Database** → **Connection string**
4. Tu vois plusieurs options :
   - `Connection` → utilise celle-ci pour `.env.local`
   - `Session` → celle-ci pour `.env.local` (DIRECT_URL)

**Pour `DATABASE_URL` (Connection avec port 6543 - pgBouncer):**
1. Sélectionne la chaîne **"PostgreSQL"** (avec pgbouncer)
2. Remplace `[YOUR-PASSWORD]` par ton mot de passe DB Supabase (créé au point 1)
3. Remplace `[HOST]` par le vrai host (ne change pas les accolades, Supabase les remplace)
4. Copie-la dans `.env.local` ligne `DATABASE_URL=`

**Pour `DIRECT_URL` (Session avec port 5432 - Direct):**
1. Même process, mais choisis la version **"PostgreSQL"** SANS pgbouncer
2. Copie-la dans `.env.local` ligne `DIRECT_URL=`

**Exemple concret:**
```
DATABASE_URL=postgresql://postgres:MON_MOT_DE_PASSE_SUPER_SECRET@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:MON_MOT_DE_PASSE_SUPER_SECRET@aws-0-eu-west-1.supabase.com:5432/postgres
```

---

### 3️⃣ Configurer le Storage (images produits)

1. Dans le Dashboard Supabase, clique sur **Storage** (colonne de gauche)
2. Clique sur **New bucket**
   - **Name:** `products`
   - ✅ Coche **"Public bucket"**
3. Clique **Create**

---

### 4️⃣ Récupérer les clés API

1. Clique sur **Settings** → **API**
2. Tu vois:
   - **Project URL** ← copie ceci pour `SUPABASE_URL`
   - **service_role** (secret) ← copie ceci pour `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ ATTENTION:**
- `Project URL` = Format : `https://abc123def456.supabase.co` (avec https://, sans slash à la fin)
- `service_role` = Commence par `eyJ...` et est **très long** (~200+ caractères)

---

### 5️⃣ Mettre à jour `.env.local`

Modifie le fichier `c:\xampp\htdocs\diabienetre\.env.local` avec tes vraies valeurs:

```bash
# Remplace [PASSWORD] par ton mot de passe DB Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[PASSWORD]@aws-0-eu-west-1.supabase.com:5432/postgres

# Remplace par ton Project URL (copié d'une étape 4)
SUPABASE_URL=https://abc123def456.supabase.co

# Remplace par ta clé service_role (copiée d'étape 4)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 6️⃣ Créer les tables dans la base de données

1. Ouvre un terminal dans le dossier `c:\xampp\htdocs\diabienetre`
2. Lance:
   ```bash
   npx prisma db push
   ```
   ✅ Cela crée les tables PostgreSQL sur Supabase

---

### 7️⃣ Redémarrer le serveur Next.js

1. **Arrête** ton serveur (Ctrl+C si running)
2. Relance:
   ```bash
   bun dev
   ```

---

### 8️⃣ Tester l'upload d'images

1. Va sur http://localhost:3000/admin (login: admin@diabienetre.sn / admin2024)
2. Clique sur **"Nouveau produit"**
3. **Sélectionne une image** → attends quelques secondes
4. **Ouvre la console du navigateur** (F12 → onglet Console)
5. Cherche les logs **[Supabase]** et **[Upload]**
6. Si tu vois "Upload successful" → ✅ Ça marche!
7. Si tu vois une erreur → **copie-la complètement** et envoie-la

---

### 🐛 Dépannage

**Erreur: "Invalid supabaseUrl: Provided URL is malformed"**
- ❌ Tu as copié `[REF]` au lieu du vrai ID projet
- ❌ Tu as oublié `https://` au début
- ❌ Tu as ajouté un `/` à la fin
- ✅ Réessaye en copiant exactement depuis Supabase → Settings → API

**Erreur: "SUPABASE_SERVICE_ROLE_KEY is not set"**
- ❌ Tu as copié la clé `anon` au lieu de `service_role`
- ✅ Récupère la clé `service_role` (celle qui commence par `eyJ`)

**"Aucun fichier fourni" ou image ne se charge**
- Vérifie que ton navigateur autorise les uploads (F12 → Network → regarde l'erreur)
- Vérifie que le bucket `products` est **Public** dans Supabase

**Erreur côté serveur (logs rouges)**
- Regarde les logs à la ligne de commande (où tu as lancé `bun dev`)
- Cherche **[Supabase]** ou **[Upload]** en rouge
- Copie le message d'erreur exactement

---

### ✅ Checklist finale

- [ ] Projet Supabase créé
- [ ] Database credentials dans `.env.local`
- [ ] Bucket `products` créé et Public ✓
- [ ] `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`
- [ ] Redémarrage du serveur fait
- [ ] Test d'upload réussi
- [ ] Envoi des images vers Supabase Storage ✓

---

💬 **Besoin d'aide?** Copie tes logs d'erreur exactement et envoie-les.
