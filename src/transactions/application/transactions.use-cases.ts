import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from '../domain/transactions.repository';

@Injectable()
export class TransactionsUseCases {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async findAll(filter: Record<string, any>) {
    return await this.transactionsRepository.findAll(filter);
  }
}
