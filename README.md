# Patrimonia

Application de gestion de patrimoine personnel.

## Stack technique

- **Frontend** : React 19, Vite, Tailwind CSS v4, Recharts, Lucide React, Axios
- **Backend** : Node.js, Express 5, SQLite (better-sqlite3), JWT, bcryptjs
- **Auth** : JWT Bearer tokens (7 jours d'expiration)

## Demarrage avec Docker (recommande)
Télécharger Docker
```bash
docker compose up --build
```

Ouvrir http://localhost dans le navigateur. C'est tout.

Les donnees SQLite sont persistees dans un volume Docker (`db-data`).

## Demarrage sans Docker (dev)

```bash
# Installer les dependances
npm install
cd backend && npm install && cd ..

# Terminal 1 — Backend (port 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
npm run dev
```

Ouvrir http://localhost:5173 dans le navigateur.

## Structure du projet

```
patrimonia/
├── src/                        # Frontend React
│   ├── api.js                  # Instance Axios avec intercepteur JWT
│   ├── App.jsx                 # Routeur principal
│   ├── main.jsx                # Point d'entree
│   ├── index.css               # Tailwind CSS
│   ├── context/
│   │   └── AuthContext.jsx     # Contexte d'authentification
│   ├── components/
│   │   ├── Sidebar.jsx         # Navigation laterale
│   │   ├── StatCard.jsx        # Carte de statistique
│   │   └── AddAssetModal.jsx   # Modale d'ajout d'actif
│   └── pages/
│       ├── Login.jsx           # Connexion / Inscription
│       ├── Dashboard.jsx       # Tableau de bord
│       └── Simulator.jsx       # Simulateur d'interets composes
├── backend/
│   ├── server.js               # API Express
│   ├── database.js             # Schema SQLite + seed categories
│   ├── Dockerfile              # Image backend Node.js
│   └── package.json
├── Dockerfile                  # Image frontend (build + nginx)
├── docker-compose.yml          # Orchestration des services
├── nginx.conf                  # Reverse proxy + SPA routing
├── package.json
└── README.md
```

## API

| Methode | Route               | Auth | Description                  |
|---------|---------------------|------|------------------------------|
| POST    | /api/auth/register  | Non  | Creer un compte              |
| POST    | /api/auth/login     | Non  | Se connecter                 |
| GET     | /api/me             | Oui  | Profil utilisateur           |
| GET     | /api/categories     | Oui  | Liste des categories         |
| GET     | /api/assets         | Oui  | Liste des actifs             |
| POST    | /api/assets         | Oui  | Ajouter un actif             |
| PUT     | /api/assets/:id     | Oui  | Modifier un actif            |
| DELETE  | /api/assets/:id     | Oui  | Supprimer un actif           |

## Categories par defaut

| Nom        | Couleur |
|------------|---------|
| Bourse     | Vert    |
| Crypto     | Violet  |
| Livrets    | Jaune   |
| Immobilier | Bleu    |
