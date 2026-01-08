import { ProviderResultRepository } from 'src/provider-results/domain/provider-result.repository';
import { Connection, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { LoggerPort } from 'src/logging/domain/logger.port';
import { formatDate } from 'src/shared/helpers/format-date.helper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProviderResultMongoRepository implements ProviderResultRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly loggerPort: LoggerPort,
  ) {}

  async findManyBy(filterData: Record<string, any>): Promise<any> {
    const {
      page = 1,
      limit = 10,
      fromDate,
      toDate,
      rouletteId,
      round,
      errorCodes,
      roundsWithOutResult,
    } = filterData;

    const filter: Record<string, any> = {};

    if (fromDate && toDate) {
      const { start_date, end_date } = formatDate(fromDate, toDate);
      filter['createdAt'] = {
        $gte: start_date,
        $lte: end_date,
      };
    }

    if (rouletteId) {
      Object.assign(filter, {
        ['id_roulette']: rouletteId,
      });
    }

    if (round) {
      filter.$or = [{ round: Number(round) }, { id_round: String(round) }];
    }

    if (errorCodes === 'ALL') {
      filter.result = { $nin: this.possibleResults };
    } else if (errorCodes) {
      filter.result = errorCodes;
    }

    let lookupStage: any = [];
    if (roundsWithOutResult) {
      filter.result = '99';

      lookupStage = [
        {
          $lookup: {
            from: 'providerresults',
            let: { roundId: '$round' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$round', '$$roundId'] },
                      { $ne: ['$result', '99'] },
                    ],
                  },
                },
              },
            ],
            as: 'resultado_existente',
          },
        },
        {
          $match: {
            'resultado_existente.0': { $exists: false },
          },
        },
      ];
    }

    const projectStage = {
      $project: {
        round: 1,
        result: 1,
        id_roulette: 1,
        id_round: 1,
        title: 1,
        info: 1,
        error: 1,
        rpm: 1,
        spin: 1,
        date: 1,
        createdAt: 1,
      },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const limitValue = Number(limit);

    try {
      const providerResultsDb = this.connection.collection('providerresults');

      const pipeline = [
        { $sort: { createdAt: -1 } },
        { $match: filter },
        ...lookupStage,
        projectStage,
        { $skip: skip },
        { $limit: limitValue },
      ];

      const results = await providerResultsDb.aggregate(pipeline).toArray();

      return {
        ok: true,
        msg: 'Logs obtenidos',
        count: results.length,
        data: results,
      };
    } catch (error) {
      this.loggerPort.error('ERROR EN PROVIDER RESULT FIND ALL', error);
      throw new Error('Error al obtener los logs del proveedor');
    }
  }

  private possibleResults = [
    '0',
    '00',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '-1',
    '99',
  ];
}
