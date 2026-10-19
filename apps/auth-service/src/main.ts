import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
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
        consumer: {
          groupId: 'auth-service-group',
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
    }),
  );
  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.listen();
}
await bootstrap();
