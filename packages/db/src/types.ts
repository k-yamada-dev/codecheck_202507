import { Prisma } from '@prisma/client';

/**
 * 外部に公開する Prisma のトランザクションクライアント型のエイリアス。
 * 直接 `@prisma/client` を各所で import させず、@acme/db 経由で利用させるためのラッパーです。
 */
export type TransactionClient = Prisma.TransactionClient;
