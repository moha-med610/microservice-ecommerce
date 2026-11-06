import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI!, {
      dbName: 'users_service_db',
    }),
  ],
})
export class DatabaseModule {}
