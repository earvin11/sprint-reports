import { Injectable } from '@nestjs/common';
import { HistoryCrupierRepository } from '../domain/history-crupier.repository';

@Injectable()
export class HistoryCrupierUseCases {
  constructor(
    private readonly historyCrupierRepository: HistoryCrupierRepository,
  ) {}

  async findAll(page = 1, limit = 10, populateFields?: string | string[]) {
    const skip = (+page - 1) * +limit;
    return await this.historyCrupierRepository.findAll(
      skip,
      limit,
      populateFields,
    );
  }
}
