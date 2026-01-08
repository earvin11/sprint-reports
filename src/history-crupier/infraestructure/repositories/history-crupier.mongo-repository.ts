import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HistoryCrupierRepository } from 'src/history-crupier/domain/history-crupier.repository';
import { HistoryCrupier } from '../models/history-crupier.model';

@Injectable()
export class HistoryCrupierMongoRepository implements HistoryCrupierRepository {
  constructor(
    @InjectModel(HistoryCrupier.name)
    private readonly historyCrupierModel: Model<HistoryCrupier>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    populateFields?: string | string[],
  ): Promise<any> {
    let query = this.historyCrupierModel.find().skip(+page).limit(+limit);

    if (populateFields) {
      query = query.populate(populateFields);
    }

    const data = await query.exec();
    return data;
  }
}
