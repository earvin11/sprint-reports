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
  ) { }

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

  async jackpots(filterData: Record<string, any>): Promise<any> {
    const {
      page = 1,
      limit = 10,
      identifierNumber,
      operatorId: operator,
      clientId: client,
      rouletteId: game,
      currency,
      fromDate,
      toDate,
    } = filterData;

    // --- Construcción del filtro base ---
    const andConditions: any[] = [];

    if (fromDate && toDate) {
      const { start_date, end_date } = formatDate(fromDate, toDate);
      andConditions.push({
        createdAt: {
          $gte: start_date,
          $lte: end_date,
        },
      });
    }

    if (operator && Types.ObjectId.isValid(operator)) {
      andConditions.push({ 'player.operator': new Types.ObjectId(operator) });
    }

    if (client && Types.ObjectId.isValid(client)) {
      andConditions.push({ 'operator.client': new Types.ObjectId(client) });
    }

    if (game) {
      const orGame: any[] = [];
      if (Types.ObjectId.isValid(game)) {
        orGame.push({ 'game._id': new Types.ObjectId(game) });
      }
      orGame.push({ 'game._id': game }); // fallback si es string no ObjectId
      if (orGame.length > 0) {
        andConditions.push({ $or: orGame });
      }
    }

    if (currency) {
      const orCurrency: any[] = [];
      if (Types.ObjectId.isValid(currency)) {
        orCurrency.push({ 'bet.currency': new Types.ObjectId(currency) });
      }
      orCurrency.push({ 'bet.currency': currency });
      if (orCurrency.length > 0) {
        andConditions.push({ $or: orCurrency });
      }
    }

    if (identifierNumber) {
      andConditions.push({ 'round.identifierNumber': identifierNumber });
    }

    // --- Pipeline de agregación ---
    const pipeline: any[] = [];

    // 1. Orden inicial
    pipeline.push({ $sort: { createdAt: -1 } });

    // 2. Lookups
    pipeline.push(
      {
        $lookup: {
          from: 'operators',
          localField: 'player.operator',
          foreignField: '_id',
          as: 'operator',
        },
      },
      { $unwind: '$operator' },
      {
        $lookup: {
          from: 'clients',
          localField: 'operator.client',
          foreignField: '_id',
          as: 'client',
        },
      },
      { $unwind: '$client' },
      {
        $lookup: {
          from: 'currencies',
          localField: 'player.currency',
          foreignField: '_id',
          as: 'currency',
        },
      },
      { $unwind: '$currency' },
      {
        $lookup: {
          from: 'providerresults',
          let: {
            idNumber: '$round.identifierNumber',
            roulette: '$game.providerId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$round', '$$idNumber'] },
                    { $eq: ['$id_roulette', '$$roulette'] },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'roundFisic',
        },
      },
      { $unwind: '$roundFisic' },
    );

    // 3. Filtros principales
    const matchStage: any = {
      type: 'credit',
      'game': { $type: 'object' },
      'roundFisic.result': { $ne: '99' },
      'bet.bet.plenoNumbers': { $ne: [] },
    };

    if (andConditions.length > 0) {
      matchStage.$and = andConditions;
    }

    pipeline.push({ $match: matchStage });

    // 4. Agregar campo resultNumber (convertido a int)
    pipeline.push({
      $addFields: {
        resultNumber: {
          $convert: {
            input: '$roundFisic.result',
            to: 'int',
            onError: null,
            onNull: null,
          },
        },
      },
    });

    // 5. Filtro de jackpot: pleno coincide + está en jackpot_values
    pipeline.push({
      $match: {
        $expr: {
          $and: [
            // Algún número en plenoNumbers coincide con resultNumber
            {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$bet.bet.plenoNumbers',
                      cond: { $eq: ['$$this.number', '$resultNumber'] },
                    },
                  },
                },
                0,
              ],
            },
            // resultNumber está en jackpot_values.number
            {
              $in: ['$resultNumber', '$round.jackpot_values.number'],
            },
          ],
        },
      },
    });

    // 6. Proyección final
    pipeline.push({
      $project: {
        _id: 0,
        transactionId: '$bet.transactionId',
        username: '$bet.player.username',
        userId: '$bet.player.userId',
        amount: 1,
        amountExchangeDollar: 1,
        currency: '$currency.short',
        operator: '$operator.name',
        client: '$client.name',
        createdAt: 1,
        resultNumber: 1,
        game: '$game.name',
        identifierNumber: '$round.identifierNumber',
        jackpot_values: '$round.jackpot_values',
        betId: '$bet._id',
        betAmount: '$bet.totalAmount',
      },
    });

    // 7. Paginación
    const skip = (Number(page) - 1) * Number(limit);
    const limitValue = Number(limit);

    pipeline.push(
      { $skip: skip },
      { $limit: limitValue }
    );

    try {
      const transactionsDb = this.connection.collection('transactions');
      const data = await transactionsDb.aggregate(pipeline).toArray();

      return {
        count: data.length,
        data,
      };
    } catch (error) {
      this.loggerPort.error('ERROR IN FIND ALL TRANSACTIONS (JACKPOT REPORT)', error);
      throw error;
    }
  }
}
