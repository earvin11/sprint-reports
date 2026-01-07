import { Injectable } from "@nestjs/common";
import { ProviderResultRepository } from "../domain/provider-result.repository";

@Injectable()
export class ProviderResultUseCases {
    constructor(
        private readonly providerResultRepository: ProviderResultRepository
    ) {}

    public findManyBy = async (filter: Record<string, any>) => {
        const data = await this.providerResultRepository.findManyBy(filter);
        return data;
    };
}
