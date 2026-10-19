import { NestFactory } from '@nestjs/core';
import { NotificationsServiceModule } from './notifications-service.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationsServiceModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'notifications-service',
          brokers: ['kafka:9092'],
        },
        consumer: {
          groupId: 'notifications-service-group',
        },
      },
    },
  );
  await app.listen();
}
await bootstrap();
