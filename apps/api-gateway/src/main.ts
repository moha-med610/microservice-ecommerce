import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { RpcToHttpExceptionFilter } from './common/filters/exception.filter.js';
import { ValidationPipe } from '@nestjs/common';
import { CustomThrottlerGuard } from '@shared/common/guards/customThrottler.guard.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new RpcToHttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('/v1/api/');
  app.enableCors();
  app.enableCsrfProtection();
  app.useGlobalGuards(app.get(CustomThrottlerGuard));

  await app.listen(process.env.PORT!);
}
await bootstrap();
