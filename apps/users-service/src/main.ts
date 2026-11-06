import { NestFactory } from '@nestjs/core';
import { UsersServiceModule } from './users-service.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersServiceModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'users-service',
          brokers: ['kafka:9092'],
        },
        retry: { initialRetryTime: 300, retries: 15 },
        consumer: {
          groupId: 'users-service-group',
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
  await app.listen();
}
await bootstrap();
