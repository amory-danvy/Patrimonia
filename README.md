# Patrimonia

Application de gestion de patrimoine personnel.

## Installation pas à pas (avec Docker)

C'est la méthode recommandée. Suivez les étapes dans l'ordre.

### Étape 1 — Installer Docker Desktop

Docker Desktop est le logiciel qui va faire tourner l'application sur votre ordinateur.

- **Windows** : [Télécharger Docker Desktop pour Windows](https://www.docker.com/products/docker-desktop/)
- **macOS (puce Apple M1/M2/M3)** : [Télécharger Docker Desktop pour Mac (Apple Silicon)](https://desktop.docker.com/mac/main/arm64/Docker.dmg)
- **macOS (puce Intel)** : [Télécharger Docker Desktop pour Mac (Intel)](https://desktop.docker.com/mac/main/amd64/Docker.dmg)
- **Linux** : [Télécharger Docker Desktop pour Linux](https://docs.docker.com/desktop/install/linux-install/)

Une fois téléchargé :

1. Lancez l'installeur et suivez les instructions.
2. Redémarrez l'ordinateur si demandé.
3. Ouvrez Docker Desktop et attendez que l'icône passe au vert (en bas à gauche).

### Étape 2 — Télécharger le code du projet

1. Allez sur la page du projet : `<URL_DU_DEPOT>`
2. Cliquez sur le bouton vert **« Code »**, puis sur **« Download ZIP »**.
3. Une fois le fichier `.zip` téléchargé, faites un clic droit dessus et choisissez **« Extraire tout… »** (Windows) ou double-cliquez (macOS).
4. Vous obtenez un dossier `patrimonia` (ou `patrimonia-main`). Déplacez-le où vous voulez, par exemple sur votre Bureau.

### Étape 3 — Ouvrir un terminal dans ce dossier

- **Windows** : ouvrez le dossier dans l'Explorateur, faites un clic droit dans la fenêtre (sur un espace vide) et choisissez **« Ouvrir dans le Terminal »**.
- **macOS** : ouvrez l'app **Terminal** (via `Cmd` + `Espace`, tapez `Terminal`), puis tapez `cd ` (avec un espace), glissez-déposez le dossier dans la fenêtre du Terminal, et appuyez sur Entrée.
- **Linux** : clic droit dans le dossier → **« Ouvrir dans un terminal »**.

### Étape 4 — Lancer l'application

Dans le terminal ouvert sur le dossier du projet, tapez :

```bash
docker compose up --build
```

Au premier lancement, le téléchargement et la construction prennent quelques minutes. Patientez jusqu'à voir le message indiquant que les services sont prêts.

### Étape 5 — Ouvrir l'application

Dans votre navigateur, allez sur : **http://localhost**

C'est tout, l'application est prête à être utilisée.

### Pour arrêter l'application

Dans le terminal, faites `Ctrl` + `C`, puis :

```bash
docker compose down
```

Vos données sont conservées dans un volume Docker (`db-data`).

## Installation sans Docker (mode développeur)

Si vous voulez modifier le code, il faut Node.js.

### Étape 1 — Installer Node.js

Téléchargez la version LTS :

- **Tous systèmes** : [Télécharger Node.js (LTS)](https://nodejs.org/fr/download)

Vérifiez l'installation dans un terminal :

```bash
node --version
npm --version
```

### Étape 2 — Installer les dépendances

```bash
npm install
cd backend && npm install && cd ..
```

### Étape 3 — Lancer le backend et le frontend

Ouvrez **deux terminaux** dans le dossier du projet.

Terminal 1 (backend, port 3001) :

```bash
cd backend
npm run dev
```

Terminal 2 (frontend, port 5173) :

```bash
npm run dev
```

Puis ouvrez **http://localhost:5173** dans votre navigateur.

## Stack technique

- **Frontend** : React 19, Vite, Tailwind CSS v4, Recharts, Lucide React, Axios
- **Backend** : Node.js, Express 5, SQLite (better-sqlite3), JWT, bcryptjs
- **Auth** : JWT Bearer tokens (7 jours d'expiration)

## Structure du projet

```
patrimonia/
├── src/             # Frontend React
├── backend/         # API Express + SQLite
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
└── README.md
```

## API

| Méthode | Route               | Auth | Description           |
|---------|---------------------|------|-----------------------|
| POST    | /api/auth/register  | Non  | Créer un compte       |
| POST    | /api/auth/login     | Non  | Se connecter          |
| GET     | /api/me             | Oui  | Profil utilisateur    |
| GET     | /api/categories     | Oui  | Liste des catégories  |
| GET     | /api/assets         | Oui  | Liste des actifs      |
| POST    | /api/assets         | Oui  | Ajouter un actif      |
| PUT     | /api/assets/:id     | Oui  | Modifier un actif     |
| DELETE  | /api/assets/:id     | Oui  | Supprimer un actif    |

## Catégories par défaut

| Nom        | Couleur |
|------------|---------|
| Bourse     | Vert    |
| Crypto     | Violet  |
| Livrets    | Jaune   |
| Immobilier | Bleu    |
