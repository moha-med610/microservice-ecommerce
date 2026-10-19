import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './services/auth/auth.module.js';
import { CustomThrottlerGuard } from '@shared/common/guards/customThrottler.guard.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'api-gateway',
    // }),

    // RATE LIMIT
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1 * 60 * 1000,
          limit: 15,
        },
      ],
    }),

    // MODULES
    AuthModule,
  ],
  providers: [CustomThrottlerGuard],
})
export class AppModule {}
