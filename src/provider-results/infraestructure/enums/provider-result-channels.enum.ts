export enum ProviderResultRpcChannelsEnum {
  GET_PROVIDER_RESULTS = 'get-provider-results',
}

const values = Object.values(ProviderResultRpcChannelsEnum).filter(
  (v) => typeof v === 'string',
);

export const providerResultsRpcChannels = [...values];
