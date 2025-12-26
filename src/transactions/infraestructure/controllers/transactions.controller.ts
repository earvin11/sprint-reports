import { Controller, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { LoggerPort } from 'src/logging/domain/logger.port';
import { transactionsRpcChannels } from '../enums/transactions-channels.enum';

@Controller('transactions')
export class TransactionsController {
  constructor(
    @Inject('REDIS_SUBSCRIBER') private readonly redisSub: Redis,
    @Inject('REDIS_PUBLISHER') private readonly redisPub: Redis,
    private readonly loggerPort: LoggerPort,
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
      }
    });
  }
}
