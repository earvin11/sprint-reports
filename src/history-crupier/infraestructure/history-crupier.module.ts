import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'src/logging/infraestructure/logger.module';
import { RedisModule } from 'src/redis/infraestructure/redis.module';
import {
  HistoryCrupier,
  HistoryCrupierSchema,
} from './models/history-crupier.model';
import { HistoryCrupierMongoRepository } from './repositories/history-crupier.mongo-repository';
import { HistoryCrupierUseCases } from '../application/history-crupier.use-cases';
import { HistoryCrupierRepository } from '../domain/history-crupier.repository';
import { HistoryCrupierController } from './controller/history-crupier.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: HistoryCrupier.name,
        schema: HistoryCrupierSchema,
      },
    ]),
    RedisModule,
    LoggerModule,
  ],
  providers: [
    HistoryCrupierMongoRepository,
    HistoryCrupierUseCases,
    {
      provide: HistoryCrupierRepository,
      useExisting: HistoryCrupierMongoRepository,
    },
  ],
  controllers: [HistoryCrupierController],
})
export class HistoryCrupierModule {}
