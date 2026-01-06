export abstract class TransactionsRepository {
  abstract findAll(filter: Record<string, any>): Promise<any>;
}
