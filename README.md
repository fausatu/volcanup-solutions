# Volcan'up Solutions

Site vitrine Volcan'up Solutions avec:

- front statique (HTML/CSS/JS)
- composants injectes (navbar/footer)
- backend API Express + Prisma pour l'espace admin Actualites

## Etat actuel

- Pages principales: `index.html`, `A-propos.html`, `Nos-prestations.html`, `Actualites.html`, `contact.html`, `Admin.html`
- Design system basique en place (`reset`, `variables`, styles composants, styles pages)
- Espace admin fonctionnel:
  - connexion admin JWT
  - publication d'articles depuis URL social media
  - suppression d'articles
  - affichage des articles sur la page Actualites
- Optimisation images engagee:
  - conversion majoritaire en `webp`
  - renommage SEO sur plusieurs assets cles

## Structure projet

```text
Volcan'up Solutions/
  Assets/
  Backend/
  Composants/
    footer.partial.html
    navbar.partial.html
  css/
    base/
      reset.css
      variables.css
    composants/
      footer.css
      navbar.css
    pages/
      admin.css
      main.css
  js/
    composants/
      navbar.js
    pages/
      admin.js
      actualites.js
    main.js
  *.html
```

## Frontend

- `js/main.js`:
  - injection de `Composants/navbar.partial.html`
  - injection de `Composants/footer.partial.html`
  - activation du menu burger
  - logique de liens actifs dans la navbar
- `css/pages/main.css`:
  - styles globaux pages publiques
  - sections A propos
  - section Prestations (hero + recrutement)
  - page Actualites

## Backend

Stack backend:

- Node.js + TypeScript
- Express
- Prisma + PostgreSQL
- JWT + bcrypt
- Zod validation

Routes principales:

- `POST /api/auth/login`
- `GET /api/articles`
- `POST /api/admin/articles` (auth admin)
- `DELETE /api/admin/articles/:id` (auth admin)

Modeles Prisma:

- `User`
- `Article`

## Lancer le projet

### Front (statique)

Servir la racine du projet avec un serveur local (VS Code Live Server ou autre).

### Backend

Depuis `Backend/`:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Variables attendues (fichier `.env` backend):

- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_ORIGIN`
- `PORT`
- (optionnel) `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`

## Conventions actuellement utilisees

- CSS:
  - `css/base` pour fondations
  - `css/composants` pour UI partages
  - `css/pages` pour styles page
- JS:
  - `js/main.js` pour bootstrap global
  - `js/pages/*` pour logique specifique

## Points de vigilance

- Les partials HTML injectes (`Composants/*.partial.html`) doivent rester des fragments simples.
- Les chemins d'images doivent rester coherents avec les renommages SEO/webp.
- Plusieurs branches historiques existent encore: verifier les merges avant cleanup.
