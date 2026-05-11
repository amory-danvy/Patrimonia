# Patrimonia

Application de gestion de patrimoine personnel.

## Installation pas à pas (avec Docker)

Docker est un outil qui empaquette une application avec tout ce dont elle a besoin pour fonctionner (code, dépendances, base de données, serveur web) dans des « conteneurs » isolés. Concrètement, ça permet de lancer Patrimonia avec une seule commande, sans installer Node.js, SQLite ou Nginx manuellement, et avec la garantie que ça fonctionnera de la même façon sur n'importe quel ordinateur.

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
4. Télécharger ou mettez a jour le sous système Linux pour windows (WSL)
5. Sur le logiciel Docker appuyez en haut a droite sur le bouton skip

### Étape 2 — Télécharger le code du projet

1. Retournez sur la page github du projet
2. Cliquez sur le bouton vert **« Code »**, puis sur **« Download ZIP »**.
3. Décompressez l'archive ZIP téléchargée.
4. Vous obtenez un dossier `patrimonia` ou `patrimonia-main`. Déplacez-le où vous voulez, par exemple sur votre Bureau.

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

Si le téléchargements échoue et affiche une erreur comme :
failed to solve /bin/sh -c apk --no-cache python3 make g++ exit code 3
Cela peut être du au fait que vous vous situez dans un établissement scolaire, le par-feux pouvant empéchez l'installation.
Dans ce cas il est préférable, d'utiliser un partage de connexion.

### Étape 5 — Ouvrir l'application

Dans votre navigateur, allez sur : **http://localhost**

### Comptes de démonstration

Au premier lancement, trois comptes de démo sont automatiquement créés avec un patrimoine pré-rempli pour faciliter la prise en main et la présentation.

| Email                  | Mot de passe | Profil                                       |
|------------------------|--------------|----------------------------------------------|
| `lea@demo.fr`          | `demo1234`   | Jeune active — patrimoine ~30 k€             |
| `thomas@demo.fr`       | `demo1234`   | Cadre — patrimoine ~250 k€                   |
| `catherine@demo.fr`    | `demo1234`   | Retraitée — patrimoine ~600 k€               |

> Ces comptes ne sont créés que si la base est vide. Pour les régénérer, supprimez le volume Docker `db-data` avec `docker compose down -v`.

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

## Guide d'utilisation

Patrimonia permet de suivre, visualiser et projeter l'évolution de votre patrimoine personnel à travers une interface web moderne. Voici en détail tout ce que vous pouvez faire.

### 1. Création de compte et connexion

Au premier accès, vous arrivez sur la page de connexion (**http://localhost**).

- **Créer un compte** : cliquez sur « Créer un compte », saisissez un email et un mot de passe, puis validez. Votre session est ouverte automatiquement après inscription.
- **Se connecter** : entrez vos identifiants et cliquez sur « Se connecter ». Un token JWT valable 7 jours est stocké dans votre navigateur, vous restez donc connecté tant que vous ne vous déconnectez pas explicitement.
- **Comptes démo** : pour tester rapidement sans créer de compte, utilisez l'un des comptes de démonstration listés plus haut (mot de passe `demo1234`).

Chaque compte est totalement isolé : vos actifs ne sont visibles que par vous.

### 2. Dashboard — la vue d'ensemble de votre patrimoine

Une fois connecté, vous arrivez sur le **Dashboard**. C'est l'écran principal de l'application, il regroupe toutes les informations clés.

**Les trois indicateurs en haut**

- **Patrimoine total** : la somme de la valeur actuelle de tous vos actifs (quantité × valeur unitaire). C'est le chiffre qui résume votre situation financière à l'instant T.
- **Plus-value** : la différence entre la valeur actuelle de votre patrimoine et son prix d'achat cumulé, exprimée en euros et en pourcentage. Affichée en vert si positive, en rouge si négative.
- **Catégories** : le nombre de types d'actifs différents que vous possédez (sur les 4 disponibles : Bourse, Crypto, Livrets, Immobilier).

**Le graphique en camembert**

Visualisation de la répartition de votre patrimoine par catégorie, avec les couleurs définies pour chaque type :

- Vert pour la Bourse
- Violet pour la Crypto
- Jaune pour les Livrets
- Bleu pour l'Immobilier

Survolez un secteur pour voir le montant exact dans cette catégorie. C'est un outil pratique pour vérifier la diversification de vos investissements.

**Le tableau des actifs**

La liste complète de vos actifs, avec pour chaque ligne :

- Nom de l'actif (ex. « Bitcoin », « Livret A », « Résidence principale »)
- Catégorie (avec une pastille de couleur)
- Quantité possédée
- Prix d'achat unitaire
- Valeur actuelle unitaire
- Plus-value calculée automatiquement (en € et en %)
- Valeur totale (quantité × valeur actuelle)
- Une icône poubelle pour supprimer la ligne

### 3. Ajouter un actif

Cliquez sur le bouton bleu **« Ajouter un actif »** en haut à droite du Dashboard. Une fenêtre s'ouvre et vous demande :

- **Nom** : libellé de votre choix (ex. « Apple », « Livret A », « Appartement Lyon »).
- **Catégorie** : à choisir parmi Bourse, Crypto, Livrets ou Immobilier.
- **Quantité** : 1 par défaut. Utile surtout pour les actions et cryptos (ex. 0.05 BTC, 50 actions TotalEnergies). Pour un bien immobilier ou un livret, laissez à 1.
- **Prix d'achat** (optionnel) : prix payé à l'unité. Sert à calculer la plus-value. Si vous ne le connaissez pas, laissez vide ou mettez 0 — la plus-value ne sera simplement pas calculée pour cet actif.
- **Valeur actuelle** : valeur unitaire d'aujourd'hui. C'est le seul champ vraiment obligatoire avec le nom et la catégorie.

Validez : l'actif apparaît immédiatement dans le tableau, le camembert et les statistiques se mettent à jour automatiquement.

### 4. Supprimer un actif

Dans le tableau, cliquez sur l'icône poubelle à droite de la ligne. Une confirmation vous est demandée pour éviter les suppressions accidentelles. La suppression est immédiate et définitive.

### 5. Générer un bilan PDF

Le bouton **« Générer mon Bilan (PDF) »** en haut à droite du Dashboard exporte un récapitulatif complet de votre patrimoine au format PDF, prêt à imprimer ou à transmettre (à un conseiller, votre banque, votre comptable, etc.).

Le PDF contient le total de votre patrimoine, la répartition par catégorie et la liste détaillée des actifs. Le bouton est désactivé tant que vous n'avez pas au moins un actif enregistré.

### 6. Simulateur d'intérêts composés

Accessible via la barre latérale gauche (icône **« Simulateur »**), cet outil permet de projeter la croissance future d'un capital placé. Pratique pour visualiser l'effet de l'épargne régulière sur le long terme.

Vous renseignez quatre paramètres :

- **Montant initial** : la somme que vous placez au départ (ex. 10 000 €).
- **Versement mensuel** : ce que vous comptez ajouter chaque mois (ex. 200 €).
- **Taux d'intérêt annuel** : le rendement attendu en % (ex. 7 % pour une moyenne historique des actions, 3 % pour un livret).
- **Durée** : sur combien d'années vous projetez (ex. 20 ans).

Le simulateur affiche en temps réel :

- Un graphique d'évolution montrant en gris le total réellement investi et en bleu le capital final avec les intérêts composés.
- Un récapitulatif chiffré : total investi, intérêts gagnés, capital final.

Modifier un paramètre met à jour le graphique instantanément, ce qui en fait un excellent outil pédagogique pour comprendre l'effet boule de neige des intérêts composés.

### 7. Déconnexion

Le bouton **« Déconnexion »** est en bas de la barre latérale gauche. Il efface votre session et vous renvoie sur la page de connexion. Vos données restent évidemment intactes côté serveur et vous pourrez vous reconnecter à tout moment.

### 8. Persistance des données

Toutes vos données (compte, actifs) sont stockées dans une base SQLite hébergée dans un volume Docker nommé `db-data`. Concrètement :

- Si vous arrêtez l'application avec `docker compose down`, les données sont **conservées** : au prochain `docker compose up`, vous retrouvez tout.
- Si vous voulez **repartir de zéro** (utile pour régénérer les comptes démo par exemple), utilisez `docker compose down -v` qui supprime le volume.

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
