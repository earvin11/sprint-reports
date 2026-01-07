import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { LoggerPort } from 'src/logging/domain/logger.port';
import { ProviderResultUseCases } from 'src/provider-results/application/provider-result.use-cases';
import { ProviderResultRpcChannelsEnum, providerResultsRpcChannels } from '../enums/provider-result-channels.enum';


@Controller('providerResults')
export class ProviderResultController implements OnModuleInit {
  constructor(
    @Inject('REDIS_SUBSCRIBER') private readonly redisSub: Redis,
    @Inject('REDIS_PUBLISHER') private readonly redisPub: Redis,
    private readonly providerResultUseCases: ProviderResultUseCases,
    private readonly loggerPort: LoggerPort,
  ) {}
  onModuleInit() {
    this.redisSub
      .subscribe(...providerResultsRpcChannels, () => {
        this.loggerPort.log(`Escuchando: ${providerResultsRpcChannels}`);
      })
      .catch((error) => {
        this.loggerPort.error(
          `Error al suscribirse a los canales de providerResultes: ${error.message}`,
        );
      });
    this.redisSub.on('message', async (channel, message) => {
      const payload = JSON.parse(message);
      const { correlationId, data, replyChannel } = payload;

      switch (channel) {
        case ProviderResultRpcChannelsEnum.GET_PROVIDER_RESULTS: {
          const resp = await this.providerResultUseCases.findManyBy(data.page, data.limit);
          await this.redisPub.publish(
            replyChannel,
            JSON.stringify({ correlationId, data: resp }),
          );
          break;
        }
        default:
          break;
      }
    });
  }
}
