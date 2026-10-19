import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';

import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new HttpException(
      {
        success: false,
        code: 'RATE_LIMIT_ERROR',
        message: 'Too Many Requests, Please Try Again Later',
      },
      429,
    );
  }
}
