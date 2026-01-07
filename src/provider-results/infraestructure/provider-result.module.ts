import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logging/infraestructure/logger.module';
import { RedisModule } from 'src/redis/infraestructure/redis.module';
import { ProviderResultMongoRepository } from './repositories/provider-result.mongo-repository';
import { ProviderResultRepository } from '../domain/provider-result.repository';
import { ProviderResultUseCases } from '../application/provider-result.use-cases';
import { ProviderResultController } from './controllers/provider-result.controller';


@Module({
    imports: [RedisModule, LoggerModule],
    providers: [
        ProviderResultMongoRepository,
        {
            provide: ProviderResultRepository,
            useExisting: ProviderResultMongoRepository,
        },
        ProviderResultUseCases,
    ],
    controllers: [ProviderResultController],
})
export class ProviderResultModule { }
