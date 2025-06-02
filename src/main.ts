import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as dotenv from 'dotenv';

import { AppModule } from './app.module';

dotenv.config();

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: '*' });
  const config = new DocumentBuilder()
    .setTitle('Эйфория')
    .setDescription('API документация')
    .setVersion('1.0')
    .addTag('euphoria')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(PORT, () => {
    console.log(`serverStarted on http://localhost:${PORT}`);
  });
}
bootstrap();
