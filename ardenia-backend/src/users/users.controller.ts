import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('first')
  async getFirstUser() {
    return this.usersService.getFirstUser();
  }
  @Get() // GET /users
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
