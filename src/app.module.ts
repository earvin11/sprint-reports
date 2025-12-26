import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RedisModule } from './redis/infraestructure/redis.module';
import { envs } from './config/envs';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionModule } from './transactions/infraestructure/transaction.module';

@Module({
  imports: [
    MongooseModule.forRoot(envs.mongoUri),
    BullModule.forRoot({
      connection: {
        host: envs.redisHost,
        port: envs.redisPort,
        password: envs.redisPassword,
      },
    }),
    RedisModule,
    TransactionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
