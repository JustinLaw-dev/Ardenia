import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private supabaseAdmin: SupabaseClient;
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    // Admin client - bypasses RLS, use carefully
    this.supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Regular client - respects RLS
    this.supabaseClient = createClient(supabaseUrl, anonKey);
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  async verifyToken(token: string) {
    const {
      data: { user },
      error,
    } = await this.supabaseClient.auth.getUser(token);
    return { user, error };
  }
}
