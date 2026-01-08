export enum HistoryCrupierRpcChannelsEnum {
  FIND_ALL = 'find-history-crupiers',
}

const values = Object.values(HistoryCrupierRpcChannelsEnum).filter(
  (v) => typeof v === 'string',
);

export const historyCrupierRpcChannelsEnum = [...values];
