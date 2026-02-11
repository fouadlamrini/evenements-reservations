# Event Reservation System - Guide d'Installation et Architecture

## 📋 Table des Matières

1. [Architecture Globale](#architecture-globale)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Docker](#docker)
6. [Développement](#développement)
7. [Tests](#tests)
8. [Déploiement](#déploiement)

---

## 🏗️ Architecture Globale

### Vue d'ensemble
```
┌─────────────────────────────────────────────────────────────┐
│                 Frontend (Next.js)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Dashboard Admin │  Pages Publiques        │   │
│  │  - Stats        │  - Liste événements     │   │
│  │  - Réservations │  - Détail événement    │   │
│  │  - Événements  │  - Authentification     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ HTTP/HTTPS
                          │
┌─────────────────────────────────────────────────────────────┐
│                 Backend (NestJS)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Auth Module    │  Events Module          │   │
│  │  - JWT          │  - CRUD                │   │
│  │  - Guards       │  - Validation           │   │
│  │                 │  - Publication          │   │
│  │                 │                         │   │
│  │  Users Module   │  Reservations Module    │   │
│  │  - CRUD        │  - Status management     │   │
│  │  - Seeder      │  - Business rules       │   │
│  │                 │                         │   │
│  │  Tickets Module │  Dashboard Module       │   │
│  │  - PDF Gen      │  - Statistics          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ Mongoose
                          │
┌─────────────────────────────────────────────────────────────┐
│                MongoDB Database                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  users      │  events      │  reservations │   │
│  │  - auth     │  - status    │  - status     │   │
│  │  - roles    │  - capacity  │  - rules      │   │
│  │             │              │               │   │
│  │  tickets   │              │               │   │
│  │  - PDF      │              │               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technologies Utilisées

#### Backend
- **Framework** : NestJS (TypeScript)
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : JWT avec bcrypt
- **Validation** : class-validator + class-transformer
- **Tests** : Jest (unitaires + e2e)
- **Documentation** : Swagger/OpenAPI

#### Frontend
- **Framework** : Next.js 14 (React 19)
- **Styling** : TailwindCSS v4
- **Authentification** : Context API + localStorage
- **HTTP Client** : Axios
- **Tests** : Jest + React Testing Library

#### Infrastructure
- **Conteneurisation** : Docker + Docker Compose
- **CI/CD** : GitHub Actions
- **Registry** : Docker Hub
- **Monitoring** : Logs intégrés

---

## 📋 Prérequis

### Système
- Node.js 20+ 
- npm ou yarn
- Git
- Docker et Docker Compose

### Optionnel (pour développement)
- MongoDB Compass (GUI)
- Postman (API testing)

---

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/your-username/evenements-reservations.git
cd evenements-reservations
```

### 2. Installation avec Docker (recommandé)
```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### 3. Installation manuelle

#### Backend
```bash
cd api
npm install
```

#### Frontend
```bash
cd web
npm install
```

---

## ⚙️ Configuration

### Variables d'Environnement

#### Backend (`api/.env`)
```env
# Database
MONGO_URI=mongodb://localhost:27017/event-reservation

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# File Upload
UPLOAD_PATH=./uploads
```

#### Frontend (`web/.env`)
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_NAME=EventReserve
```

### Créer la base de données
```bash
# Avec Docker (automatique)
docker-compose up -d mongodb

# Manuellement
mongosh
use event-reservation
db.createUser({
  user: "admin",
  pwd: "password",
  roles: ["readWrite", "dbAdmin"]
})
```

---

## 🐳 Docker

### Services Disponibles
```yaml
services:
  mongodb:    # Base de données MongoDB
  api:        # Backend NestJS (port 3000)
  web:         # Frontend Next.js (port 3001)
```

### Commandes Utiles
```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Reconstruire les images
docker-compose build --no-cache

# Voir les logs d'un service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f mongodb

# Exécuter une commande dans un conteneur
docker-compose exec api npm run test
docker-compose exec web npm run dev
```

---

## 💻 Développement

### Lancer en mode développement

#### Backend
```bash
cd api
npm run start:dev
# API disponible sur http://localhost:3000
```

#### Frontend
```bash
cd web
npm run dev
# Application disponible sur http://localhost:3001
```

### Structure des Projets

#### Backend (`api/src/`)
```
src/
├── auth/           # Authentification JWT
├── users/          # Gestion utilisateurs
├── events/         # Gestion événements
├── reservation/    # Gestion réservations
├── tickets/        # Génération tickets PDF
├── roles/          # Définition rôles
├── guards/         # Middleware sécurité
├── dto/            # Data Transfer Objects
└── schemas/        # Schémas Mongoose
```

#### Frontend (`web/`)
```
app/
├── admin/          # Interface admin
├── events/         # Pages événements
├── participant/    # Espace participant
├── login/          # Connexion
└── register/       # Inscription

components/
├── Header.tsx      # Navigation principale
├── FormInput.tsx   # Champ formulaire réutilisable
└── AdminSidebar.tsx # Menu admin

context/
└── AuthContext.tsx  # Gestion état authentification

services/
└── api.ts          # Client HTTP Axios
```

---

## 🧪 Tests

### Backend
```bash
cd api

# Tests unitaires
npm run test

# Tests avec watch
npm run test:watch

# Tests e2e
npm run test:e2e

# Couverture de code
npm run test:cov
```

### Frontend
```bash
cd web

# Tests composants
npm run test

# Tests avec watch
npm run test:watch
```

### Types de Tests

#### Backend
- **Unitaires** : Services métiers (Events, Reservations, Auth)
- **Integration** : Controllers avec base de données test
- **E2E** : Scénarios complets avec rôles distincts

#### Frontend
- **Composants** : Tests React Testing Library
- **Fonctionnels** : Flux utilisateur (réservation, annulation)

---

## 🚀 Déploiement

### Production avec Docker
```bash
# Construire les images
docker-compose -f docker-compose.prod.yml build

# Démarrer en production
docker-compose -f docker-compose.prod.yml up -d
```

### Variables d'Environnement Production
```env
# Backend
NODE_ENV=production
MONGO_URI=mongodb://mongodb:27017/event-reservation-prod
JWT_SECRET=your-production-secret

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### CI/CD Pipeline
La pipeline GitHub Actions automatise :

1. **Tests** : Lint + Tests unitaires + E2E
2. **Build** : Construction des applications
3. **Security Scan** : Analyse des vulnérabilités
4. **Docker** : Build et push des images
5. **Deploy** : Déploiement automatique en staging

### Monitoring
- **Logs** : `docker-compose logs -f`
- **Health Checks** : Endpoints `/health`
- **Metrics** : Dashboard admin avec statistiques

---

## 🔧 Dépannage

### Problèmes Communs

#### Port déjà utilisé
```bash
# Voir les processus sur les ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Tuer les processus
sudo kill -9 <PID>
```

#### Connexion MongoDB refusée
```bash
# Vérifier si MongoDB tourne
docker-compose ps mongodb

# Redémarrer MongoDB
docker-compose restart mongodb
```

#### Tests échouent
```bash
# Nettoyer les caches
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Pour les tests e2e, s'assurer que la BDD est vide
npm run test:db:reset
```

### Logs Utiles
```bash
# Backend logs
docker-compose logs -f api

# Frontend logs
docker-compose logs -f web

# MongoDB logs
docker-compose logs -f mongodb
```

---

## 📚 Documentation Complémentaire

- [Diagramme de Classes](./class-diagram.md)
- [API Documentation](http://localhost:3000/api) (Swagger)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [License](./LICENSE)

---

## 🤝 Support

Pour toute question ou problème :

1. Vérifier les logs ci-dessus
2. Consulter la documentation
3. Créer une issue GitHub avec :
   - Description détaillée
   - Logs d'erreur
   - Environnement (OS, Node.js version)
   - Étapes pour reproduire

---

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.
