import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logging/infraestructure/logger.module';
import { RedisModule } from 'src/redis/infraestructure/redis.module';
import { TransactionsMongoRepository } from './repositories/transactions.mongo-repository';
import { TransactionsUseCases } from '../application/transactions.use-cases';
import { TransactionsRepository } from '../domain/transactions.repository';
import { TransactionsController } from './controllers/transactions.controller';

@Module({
  imports: [RedisModule, LoggerModule],
  providers: [
    TransactionsMongoRepository,
    {
      provide: TransactionsRepository,
      useExisting: TransactionsMongoRepository,
    },
    TransactionsUseCases,
  ],
  controllers: [TransactionsController],
})
export class TransactionModule {}
