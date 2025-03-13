import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AppService } from '../src/app.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const appService = await app.resolve(AppService);

  await appService.runTestFlow();
  await app.close();
}

bootstrap();
