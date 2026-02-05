"# evenements-reservations" 

src/
├── main.ts
├── app.module.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── jwt.strategy.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── seeder/
│   │   └── users.seeder.ts
│   ├── dto/
│   │   └── create-user.dto.ts
│   └── schema/
│       └── user.schema.ts
├── roles/
│   ├── role.enum.ts
│   ├── roles.decorator.ts
│   └── roles.guard.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
└── .env
