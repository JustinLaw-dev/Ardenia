import { config } from 'dotenv';
config(); // loads .env from backend root

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS from frontend URL
  app.enableCors({ origin: process.env.FRONTEND_URL });

  // Listen on the port defined in .env (default to 3001 if missing)
  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port);

  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
