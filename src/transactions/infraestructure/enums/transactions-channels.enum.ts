export enum TransactionsRpcChannelsEnum {
  FIND_ALL = 'find-transactions',
}

const values = Object.values(TransactionsRpcChannelsEnum).filter(
  (v) => typeof v === 'string',
);

export const transactionsRpcChannels = [...values];
