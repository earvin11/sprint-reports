import { ProviderResultEntity } from "../domain/provider-result.entity";
import { ProviderResultRepository } from "../domain/provider-result.repository";
import { ProviderResult } from "../domain/provider-result.value";

export class ProviderResultUseCases {
    constructor(
        private readonly providerResultRepository: ProviderResultRepository
    ) {}

    public findManyBy = async (filter: Record<string, any>) => {
        const data = await this.providerResultRepository.findManyBy(filter);
        return data;
    };

    public update = async (
        id: string,
        dataToUpdate: Partial<ProviderResultEntity>
    ) => {
        const data = await this.providerResultRepository.update(
            id,
            dataToUpdate
        );
        return data;
    };

    public remove = async (id: string) => {
        const data = await this.providerResultRepository.remove(id);
        return data;
    };

    public findBy = async (filter: Record<string, any>) => {
        const data = await this.providerResultRepository.findBy(filter);
        return data;
    };
}
