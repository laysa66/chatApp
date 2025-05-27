# ws-chat :

## Présentation

**ws-chat** est une application de chat temps réel, organisée en monorepo avec Yarn Workspaces. Elle comprend :
- Un frontend Vue 3 (Vite)
- Un backend Node.js/Express
- Un module `common` partagé (types, utilitaires)
- Une base de données PostgreSQL
- Un reverse proxy Traefik pour le routage et les certificats SSL

Le déploiement et l'orchestration sont assurés par Docker et Docker Compose.

---

## Structure du projet

```
chat_app/
├── packages/
│   ├── common/      # Typescript: types et utilitaires partagés
│   ├── front/       # Frontend Vue 3 + Vite
│   ├── server/      # Backend Node.js/Express/TypeScript
│   └── deploy/      # Docker Compose, Traefik, DB init
├── package.json     # Monorepo root, scripts globaux
└── README.MD
```

---

## Composants principaux

### Frontend (`packages/front`)
- Vue 3 + Vite
- Pinia (state management)
- Vue Router
- Socket.IO Client
- Authentification par token stocké dans un cookie sécurisé (js-cookie)
- Configuration via `.env`

### Backend (`packages/server`)
- Node.js + Express + TypeScript
- API RESTful
- Authentification JWT
- Chiffrement des mots de passe avec bcrypt
- Socket.IO
- PostgreSQL
- Variables d'environnement via fichiers `config/`

### Common (`packages/common`)
- Types TypeScript et utilitaires partagés

### Orchestration & Déploiement (`packages/deploy`)
- `docker-compose.yaml` : tous les services (front, back, db, traefik)
- Traefik : reverse proxy, HTTPS, routage sous-domaines
- DB : initialisation via script SQL

---

## Prérequis
- Docker & Docker Compose
- Node.js >= 18.12.0 (si vous souhaitez développer en local sans Docker)
- Yarn >= 1.22 (si vous souhaitez développer en local sans Docker)

---

## Lancement du projet en local

### **Développement local avec Yarn**
Pour développer chaque service séparément (hot reload, debug, etc.) :
> **Assurez-vous d'être dans le dossier racine (`chat_app/`) avant d'exécuter ces commandes.**

```bash
yarn install
# Si la base de données est déjà démarrée, passez cette étape. Sinon, lancez-la avec :
yarn run dev:dependencies:up
yarn run dev
```

### **Lancement en mode production buildé (de preference)**
Pour lancer toute la stack comme en production, il suffit d'utiliser Docker Compose :
```bash
docker compose -f packages/deploy/docker-compose-dev.yaml up -d --build
```

- Tous les services (front, back, db, traefik) sont lancés en mode détaché.
- Les images sont buildées automatiquement si besoin.
- Les variables d’environnement sont injectées via les fichiers `.env` de chaque package.

Pour arrêter la stack :
```bash
docker compose -f packages/deploy/docker-compose-dev.yaml down
```

---

## Accès à l'application
- Frontend : http://localhost:3000 
- Backend API : http://localhost:4000

---
## Connexion avec comptes de test (Seed Data)

Vous pouvez vous connecter en utilisant un des comptes suivants, **qui SONT des données de test (seed data)** :

- 👉 **En tant qu'administrateur :**  
  `alice@example.com` / `password1`

- 👉 **En tant qu'utilisateur simple :**  
  `bob@example.com` / `password2`

Pour plus d'informations sur l'utilisation des seed data dans une base de données, consultez la documentation officielle :  
https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding

```Vous pouvez créer des comptes pour une expérience complète aussi```


---


## Sécurité & bonnes pratiques
- Les tokens sont stockés dans des cookies sécurisés (js-cookie)
- Les imports partagés utilisent le dossier `common` via des imports relatifs
- Les variables sensibles sont dans des fichiers `.env` non versionnés
- Traefik gère le HTTPS et le routage (uniquement en production finale sur le serveur)
- La base de données est initialisée avec un script SQL pour créer les tables nécessaires et le jeu de données initial pour la démonstration.

---

## Scripts utiles
- Build global : `yarn build`
- Lancer le projet en mode dev : `yarn dev`
- Lancer la stack docker en mode production : `yarn prod:docker:dev:up`
- Arrêter la stack docker : `yarn prod:docker:dev:down`
- Lancer uniquement la DB : `yarn dev:dependencies:up`
- Arrêter uniquement la DB : `yarn dev:dependencies:down`
- Lint global : `yarn lint`

---

## Références
- [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/)
- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [Socket.IO](https://socket.io/)
- [Traefik](https://doc.traefik.io/traefik/)
- [Docker Compose](https://docs.docker.com/compose/)

---


