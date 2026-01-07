import { Controller, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { LoggerPort } from 'src/logging/domain/logger.port';
import {
  transactionsRpcChannels,
  TransactionsRpcChannelsEnum,
} from '../enums/transactions-channels.enum';
import { TransactionsUseCases } from 'src/transactions/application/transactions.use-cases';

@Controller('transactions')
export class TransactionsController {
  constructor(
    @Inject('REDIS_SUBSCRIBER') private readonly redisSub: Redis,
    @Inject('REDIS_PUBLISHER') private readonly redisPub: Redis,
    private readonly loggerPort: LoggerPort,
    private readonly transactionsUseCases: TransactionsUseCases,
  ) {}

  onModuleInit() {
    this.redisSub
      .subscribe(...transactionsRpcChannels, () => {
        this.loggerPort.log(`Escuchando: ${transactionsRpcChannels}`);
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
        case TransactionsRpcChannelsEnum.FIND_ALL: {
          const resp = await this.transactionsUseCases.findAll(data.data);

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
