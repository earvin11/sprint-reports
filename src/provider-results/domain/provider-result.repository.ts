import { ProviderResultEntity } from './provider-result.entity';

export abstract class ProviderResultRepository {
  abstract findManyBy(
    filter: Record<string, any>,
  ): Promise<ProviderResultEntity[] | []>;
}
