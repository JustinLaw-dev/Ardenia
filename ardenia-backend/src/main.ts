import { config } from 'dotenv';
config(); // loads .env from backend root

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types
      },
    }),
  );

  // Enable CORS from frontend URL
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Listen on the port defined in .env (default to 3001 if missing)
  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port);

  console.log(`
╔════════════════════════════════════════════╗
║   ARDENIA V1 - ADHD Task Management MVP    ║
║   Enterprise-Grade Backend API             ║
╠════════════════════════════════════════════╣
║   Status: Running                          ║
║   Port: ${port}                             ║
║   URL: http://localhost:${port}             ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
╚════════════════════════════════════════════╝
  `);
}
bootstrap();
