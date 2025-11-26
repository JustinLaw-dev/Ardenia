import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@User() user: any) {
    return {
      id: user.id,
      email: user.email,
      // ... other user data
    };
  }

  @Get('first')
  async getFirstUser() {
    return this.usersService.getFirstUser();
  }
  @Get() // GET /users
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
