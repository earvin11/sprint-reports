export abstract class HistoryCrupierRepository {
  abstract findAll(
    page: number,
    limit: number,
    populateFields?: string | string[],
  ): Promise<any>;
}
