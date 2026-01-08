import { Controller, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { HistoryCrupierUseCases } from 'src/history-crupier/application/history-crupier.use-cases';
import { LoggerPort } from 'src/logging/domain/logger.port';
import {
  HistoryCrupierRpcChannelsEnum,
  historyCrupierRpcChannelsEnum,
} from '../enums/history-crupier-channels.enum';

@Controller('history-crupier')
export class HistoryCrupierController {
  constructor(
    @Inject('REDIS_SUBSCRIBER') private readonly redisSub: Redis,
    @Inject('REDIS_PUBLISHER') private readonly redisPub: Redis,
    private readonly loggerPort: LoggerPort,
    private readonly historyCrupierUseCases: HistoryCrupierUseCases,
  ) {}

  onModuleInit() {
    this.redisSub
      .subscribe(...historyCrupierRpcChannelsEnum, () => {
        this.loggerPort.log(`Escuchando: ${historyCrupierRpcChannelsEnum}`);
      })
      .catch((error) => {
        this.loggerPort.error(
          `Error al suscribirse a los canales de currencies: ${error.message}`,
        );
      });
    this.redisSub.on('message', async (channel, message) => {
      const payload = JSON.parse(message);
      const { correlationId, data, replyChannel } = payload;

      switch (channel) {
        case HistoryCrupierRpcChannelsEnum.FIND_ALL: {
          const resp = await this.historyCrupierUseCases.findAll(data.data);

          await this.redisPub.publish(
            replyChannel,
            JSON.stringify({ correlationId, data: resp }),
          );
          break;
        }
      }
    });
  }
}
