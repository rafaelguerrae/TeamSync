import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = isProduction 
    ? [
        'https://team-sync-alpha.vercel.app', // Your Vercel frontend URL
        'https://teamsync-rrpp.onrender.com'  // Your backend URL (for Swagger)
      ]
    : true; // Allow all origins in development

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Important for cookies
    allowedHeaders: 'Content-Type,Accept,Authorization',
  });

  // Use cookie-parser middleware
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('NestJS CRUD API')
    .setDescription('API created with NestJS')
    .setVersion('1.0')
    .addBearerAuth() // Use standard bearer auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
