import { NestFactory } from '@nestjs/core';
import { UsersServiceModule } from './users-service.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(UsersServiceModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'users-service',
        brokers: ['kafka:9092'],
      },
      retry: { initialRetryTime: 300, retries: 15 },

      producer: {
        allowAutoTopicCreation: true,
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3002,
      retryDelay: 300,
      retryAttempts: 5,
    },
  });

  await app.startAllMicroservices();
  await app.listen(4002);
}
await bootstrap();
