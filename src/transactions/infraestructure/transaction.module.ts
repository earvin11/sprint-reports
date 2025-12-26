import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logging/infraestructure/logger.module';
import { RedisModule } from 'src/redis/infraestructure/redis.module';

@Module({
  imports: [RedisModule, LoggerModule],
})
export class TransactionModule {}
