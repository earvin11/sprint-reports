export abstract class TransactionsRepository {
  abstract findAll(filter: Record<string, any>): Promise<any>;
  abstract jackpots(filter: Record<string, any>): Promise<any>;
}
