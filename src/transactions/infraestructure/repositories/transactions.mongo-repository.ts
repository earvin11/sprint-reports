import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { LoggerPort } from 'src/logging/domain/logger.port';
import { formatDate } from 'src/shared/helpers/format-date.helper';
import { TransactionsRepository } from 'src/transactions/domain/transactions.repository';

@Injectable()
export class TransactionsMongoRepository implements TransactionsRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly loggerPort: LoggerPort,
  ) {}

  async findAll(filterData: Record<string, any>): Promise<any> {
    const {
      page,
      limit,
      fromDate,
      toDate,
      clientId,
      operatorId,
      rouletteId,
      currency,
      identifierNumber,
    } = filterData;

    const filter = {};

    if (fromDate && toDate) {
      filter['createdAt'] = {
        $lte: formatDate(fromDate, toDate).end_date,
        $gte: formatDate(fromDate, toDate).start_date,
      };
    }

    if (clientId) filter['operator.client'] = new Types.ObjectId(clientId);
    if (operatorId) filter['player.operator'] = new Types.ObjectId(operatorId);
    if (rouletteId) filter['game._id'] = new Types.ObjectId(rouletteId);
    if (currency) filter['bet.currency'] = new Types.ObjectId(currency);
    if (identifierNumber)
      filter['$or'] = [
        { 'round._id': new Types.ObjectId(identifierNumber) },
        { 'round.identifierNumber': identifierNumber },
      ];

    try {
      const transactionsDb = this.connection.collection('transactions');
      const data = await transactionsDb
        .aggregate([
          { $sort: { createdAt: -1 } },
          [
            {
              $lookup: {
                from: 'operators',
                localField: 'player.operator',
                foreignField: '_id',
                as: 'operator',
                pipeline: [
                  {
                    $project: {
                      client: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: '$operator',
            },
            {
              $match: {
                type: {
                  $in: ['credit', 'debit'],
                },
                'game.type': 'roulette',
                $or: [{ grouped: false }, { grouped: undefined }],
                ...filter,
              },
            },
            {
              $project: {
                type: 1,
                amount: 1,
                amountExchangeDollar: 1,
                _id: 1,
                'bet._id': 1,
                'bet.currency': 1,
                'bet.transactionId': 1,
                'game._id': 1,
                'game.name': 1,
                'player.operator': 1,
                'player._id': 1,
                'player.WL': 1,
                'player.userId': 1,
                'player.username': 1,
                'player.isAdmin': 1,
                grouped: 1,
                createdAt: 1,
              },
            },
            {
              $skip: (Number(page) - 1) * Number(limit),
            },
            {
              $limit: Number(limit),
            },
          ],
        ])
        .toArray();

      //TODO: manejar profit
      //   for (let index = 0; index < data.length; index++) {

      //     const element = data[index];
      //     //TODO:
      //     // await ProfitMongoRepository.create(element, true)

      //   }

      return {
        count: data.length,
        data,
      };
    } catch (error) {
      this.loggerPort.error('ERROR IN FIND ALL TRANSACTIONS', error);
      throw error;
    }
  }
}
