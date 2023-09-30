import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const port = 3000;
  const app = await NestFactory.create(
    AppModule,
    //   {
    //   logger: ['error', 'warn', 'debug'],
    // }
  );
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port);
  console.log(`Listening on http://localhost:${port}`);
}
bootstrap();
