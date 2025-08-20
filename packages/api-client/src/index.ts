import { initClient } from '@ts-rest/core';
import type { ClientArgs } from '@ts-rest/core';
import { contract } from '@acme/contracts';

// 共通の baseUrl/baseHeaders をここで一元化
export type CreateApiClientOptions = {
  baseUrl: string;
  baseHeaders?: ClientArgs['baseHeaders']; // () => HeadersInit もOK
};

export const createApiClient = ({ baseUrl, baseHeaders }: CreateApiClientOptions) =>
  initClient(contract, { baseUrl, baseHeaders });
