import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users.service';
import { Role } from '../../roles/role.enum';

@Injectable()
export class UsersSeeder implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    const adminEmail = 'admin@event.com';

    // Check if admin already exists
    const existingAdmin = await this.usersService.findByEmail(adminEmail);
    if (existingAdmin) return; // Admin exists, do nothing

    // Create Admin
    await this.usersService.create(
      {
        name: 'Admin',
        email: adminEmail,
        password: 'Admin123!',
      },
      Role.Admin,
    );

    console.log('✅ Admin user created');
  }
}
