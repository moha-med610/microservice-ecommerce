import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AllRpcExceptionsFilter } from '@shared/common/filters/rpc-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      retryAttempts: 5,
      retryDelay: 3000,
      host: '0.0.0.0',
      port: 3001,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth-service',
        brokers: ['kafka:9092'],
      },
      retry: { initialRetryTime: 300, retries: 15 },

      producer: {
        allowAutoTopicCreation: true,
      },
    },
  });

  await app.startAllMicroservices();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => new RpcException(errors),
    }),
  );
  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.listen(4001);
}
await bootstrap();
