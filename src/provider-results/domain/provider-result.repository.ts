import { ProviderResultEntity } from "./provider-result.entity";

export abstract class ProviderResultRepository {
    abstract findManyBy(
        filter: Record<string, any>
    ): Promise<ProviderResultEntity[] | []>;
    abstract update(
        id: string,
        data: Partial<ProviderResultEntity>
    ): Promise<ProviderResultEntity | null>;
    abstract remove(id: string): Promise<ProviderResultEntity | null>;
    abstract findBy(
        filter: Record<string, any>
    ): Promise<ProviderResultEntity | null>;
}
