import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UsersService {
  private prisma = new PrismaClient();

  // fetch the first user (or you can fetch by ID)
  async getFirstUser() {
    try {
      return await this.prisma.user.findMany();
    } catch (err) {
      console.error('Prisma error:', err);
      throw err; // so NestJS still sends 500
    }
  }
  // fetch all users
  async getAllUsers() {
    try {
      return await this.prisma.user.findFirst();
    } catch (err) {
      console.error('Prisma error:', err);
      throw err;
    }
  }
}
