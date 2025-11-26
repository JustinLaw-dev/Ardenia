import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [UsersModule, SupabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
