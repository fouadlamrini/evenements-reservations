# Diagramme de Classes - Event Reservation System

## Vue d'ensemble

Ce diagramme présente les entités principales et leurs relations dans le système de réservation d'événements.

## Entités Principales

### 1. User (Utilisateur)
```typescript
class User {
  _id: ObjectId;
  email: string;
  password: string; // hashé avec bcrypt
  role: Role; // Admin | Participant
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Relations :**
- Crée des événements (1:N) - en tant qu'Admin
- Fait des réservations (1:N) - en tant que Participant

### 2. Event (Événement)
```typescript
class Event {
  _id: ObjectId;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  maxCapacity: number;
  status: EventStatus; // DRAFT | PUBLISHED | CANCELED
  creatorId: ObjectId; // référence à User
  createdAt: Date;
  updatedAt: Date;
}
```

**Relations :**
- Appartient à un créateur (N:1) - User
- Contient des réservations (1:N) - Reservation

### 3. Reservation (Réservation)
```typescript
class Reservation {
  _id: ObjectId;
  eventId: ObjectId; // référence à Event
  participantId: ObjectId; // référence à User
  status: ReservationStatus; // PENDING | CONFIRMED | REFUSED | CANCELED
  canceledBy?: 'ADMIN' | 'PARTICIPANT';
  createdAt: Date;
  updatedAt: Date;
}
```

**Relations :**
- Appartient à un événement (N:1) - Event
- Appartient à un participant (N:1) - User

### 4. Ticket (Ticket)
```typescript
class Ticket {
  _id: ObjectId;
  reservationId: ObjectId; // référence à Reservation
  pdfPath: string;
  qrCode: string;
  generatedAt: Date;
}
```

**Relations :**
- Généré pour une réservation (1:1) - Reservation

## Énumérations

### Role (Rôle)
```typescript
enum Role {
  Admin = 'Admin',
  Participant = 'Participant'
}
```

### EventStatus (Statut d'Événement)
```typescript
enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELED = 'CANCELED'
}
```

### ReservationStatus (Statut de Réservation)
```typescript
enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REFUSED = 'REFUSED',
  CANCELED = 'CANCELED'
}
```

## Relations entre Entités

```
User (1) ──────── (N) Event
 │                     │
 │                     │
 │                     │
 │                     └─── (1) ──── (N) Reservation
 │                                   │
 │                                   │
 └───────── (N) ─────────────────────┘
```

## Workflow des Statuts

### Cycle de vie d'un Événement
```
DRAFT ──(publish())──► PUBLISHED
  │                         │
  │                         └───(cancel())──► CANCELED
  └───(cancel())──► CANCELED
```

### Cycle de vie d'une Réservation
```
PENDING ──(confirm())──► CONFIRMED
  │          │
  │          ├───(refuse())──► REFUSED
  │          │
  │          ├───(cancel())──► CANCELED
  │          │
  └──────────┘
```

## Contraintes et Validation

### Règles Métier
1. **Un utilisateur ne peut réserver que des événements PUBLISHED**
2. **Un utilisateur ne peut pas réserver deux fois le même événement**
3. **La capacité maximale d'un événement ne peut être dépassée**
4. **Seul un Admin peut créer/modifier/supprimer des événements**
5. **Seul un Admin peut confirmer/refuser des réservations**
6. **Un ticket PDF n'est généré que pour les réservations CONFIRMED**

### Validation des Données
- **Email** : format valide et unique
- **Password** : minimum 6 caractères, hashé avec bcrypt
- **Event** : titre, description, date, lieu, capacité obligatoires
- **Reservation** : eventId et participantId obligatoires

## Sécurité

### Authentification et Autorisation
- **JWT Tokens** pour l'authentification
- **Role-based Access Control (RBAC)**
  - Admin : accès complet
  - Participant : accès limité
- **Guards** sur les routes sensibles

### Protection des Routes
```
POST /auth/login          - Public
POST /auth/register       - Public
GET  /events            - Public
POST /events            - Admin only
PATCH /events/:id/publish - Admin only
POST /reservation         - Participant only
PATCH /reservation/:id   - Admin only
```

## Architecture Technique

### Backend (NestJS)
```
src/
├── auth/           # Authentification JWT
├── users/          # Gestion utilisateurs
├── events/         # Gestion événements
├── reservation/    # Gestion réservations
├── tickets/        # Génération tickets PDF
├── roles/          # Définition rôles
└── guards/         # Middleware de sécurité
```

### Frontend (Next.js)
```
app/
├── admin/          # Dashboard admin
├── events/         # Liste/détail événements
├── participant/    # Espace participant
├── login/          # Page connexion
└── register/       # Page inscription
```

### Base de Données (MongoDB)
- **Collections** : users, events, reservations, tickets
- **Index** : email (unique), status, dates
- **Relations** : références ObjectId entre collections

## API Endpoints

### Authentification
- `POST /auth/login` - Connexion
- `POST /auth/register` - Inscription

### Événements
- `GET /events` - Liste événements publiés
- `POST /events` - Créer événement (Admin)
- `PATCH /events/:id/publish` - Publier événement (Admin)
- `GET /events/dashboard/stats` - Statistiques dashboard (Admin)

### Réservations
- `POST /reservation` - Créer réservation (Participant)
- `GET /reservation` - Liste toutes réservations (Admin)
- `GET /reservation/participant` - Réservations utilisateur (Participant)
- `PATCH /reservation/:id` - Mettre à jour statut (Admin)
- `PATCH /reservation/:id/cancel` - Annuler réservation

### Tickets
- `GET /tickets/:reservationId/download` - Télécharger ticket PDF
