import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // ConfigService를 통해 설정값 가져오기
  const corsOrigins = configService.get<string>('CORS_ORIGIN').split(',').map(origin => origin.trim());
  const corsCredentials = configService.get<boolean>('CORS_CREDENTIALS');

  app.enableCors({
    origin: corsOrigins,
    credentials: corsCredentials,
  });

  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT');
  await app.listen(port, '0.0.0.0');
}
bootstrap();
