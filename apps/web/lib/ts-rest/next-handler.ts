import { initServer } from '@ts-rest/express';
import type { AppRoute, AppRouter } from '@ts-rest/core';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { AppRouteImplementation } from '@ts-rest/express';

const server = initServer();

type AppRouteImplementationOrOptions<T extends AppRoute> =
  | AppRouteImplementation<T>
  | any;
type RouterImplementation<T extends AppRouter> = any;

type NextHandler = (
  req: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

export function createRouteHandler<T extends AppRoute>(
  contract: T,
  implementation: AppRouteImplementationOrOptions<T>
): NextHandler;
export function createRouteHandler<T extends AppRouter>(
  contract: T,
  implementation: RouterImplementation<T>
): { [K in keyof RouterImplementation<T>]: NextHandler };
export function createRouteHandler(
  contract: AppRouter | AppRoute,
  implementation:
    | RouterImplementation<AppRouter>
    | AppRouteImplementationOrOptions<AppRoute>
) {
  const makeHandler =
    <
      TArgs,
      TResult extends {
        status: number;
        body?: unknown;
        headers?: Record<string, string>;
      },
    >(
      fn: (args: TArgs) => Promise<TResult>
    ): NextHandler =>
    async (req, context) => {
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
      } as TArgs);
      return NextResponse.json(result.body, {
        status: result.status,
        headers: result.headers as Record<string, string> | undefined,
      });
    };

  if (typeof implementation === 'function') {
    const routeImpl = server.route(
      contract as AppRoute,
      implementation as AppRouteImplementation<AppRoute>
    );
    return makeHandler(routeImpl as any);
  }

  const routerImpl = server.router(
    contract as AppRouter,
    implementation as RouterImplementation<AppRouter>
  );

  const handlers: Partial<Record<keyof typeof routerImpl, NextHandler>> = {};
  for (const key of Object.keys(routerImpl) as Array<keyof typeof routerImpl>) {
    const route = routerImpl[key] as AppRouteImplementation<AppRoute>;
    handlers[key] = makeHandler(route as any);
  }
  return handlers as { [K in keyof typeof routerImpl]: NextHandler };
}

export default createRouteHandler;
