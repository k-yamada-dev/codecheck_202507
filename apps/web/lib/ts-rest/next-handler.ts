import { initServer } from '@ts-rest/express';
import type { AppRoute, AppRouter } from '@ts-rest/core';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const server = initServer();

// Create Next.js route handlers from a ts-rest contract and implementation.
export function createRouteHandler<T extends AppRouter | AppRoute>(
  contract: T,
  implementation: T extends AppRouter ? any : any,
) {
  const isRoute = typeof implementation === 'function';
  const serverImpl = isRoute
    ? server.route(contract as AppRoute, implementation as any)
    : server.router(contract as AppRouter, implementation as any);

  const makeHandler = (fn: any) =>
    async (req: NextRequest, context: { params: any }) => {
      let body: unknown;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        try {
          body = await req.json();
        } catch {
          body = undefined;
        }
      }
      const result = await fn({
        body,
        query: Object.fromEntries(req.nextUrl.searchParams.entries()),
        params: context.params,
        headers: Object.fromEntries(req.headers.entries()),
        req,
      });
      return NextResponse.json(result.body, {
        status: result.status,
        headers: result.headers as Record<string, string> | undefined,
      });
    };

  if (isRoute) {
    return makeHandler(serverImpl);
  }

  const handlers: Record<string, any> = {};
  for (const key of Object.keys(serverImpl)) {
    handlers[key] = makeHandler((serverImpl as any)[key]);
  }
  return handlers as any;
}

export default createRouteHandler;
