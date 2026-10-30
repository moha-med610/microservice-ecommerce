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
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'auth-service',
          brokers: ['kafka:9092'],
        },
        retry: { initialRetryTime: 300, retries: 15 },
        consumer: {
          groupId: 'auth-service-group',
          allowAutoTopicCreation: true,
          sessionTimeout: 30000,
          heartbeatInterval: 3000,
        },
        producer: {
          allowAutoTopicCreation: true,
        },
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => new RpcException(errors),
    }),
  );
  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.listen();
}
await bootstrap();
