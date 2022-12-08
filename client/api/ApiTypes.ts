import { QueryClient, QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

type AsyncFunction = (...args: unknown[]) => Promise<unknown>;

export type QueryOptions<TMethod extends AsyncFunction, TReturn = Awaited<ReturnType<TMethod>>> = UseQueryOptions<TReturn, unknown, TReturn>;
export type MutationOptions<TMethod extends AsyncFunction, TReturn = Awaited<ReturnType<TMethod>>> = UseMutationOptions<TReturn, unknown, Parameters<TMethod>[0], unknown>;

export interface QueryFunction<TMethod extends AsyncFunction, TReturn = Awaited<ReturnType<TMethod>>>{
  (
    filters?: Parameters<TMethod>[0],
    options?: QueryOptions<TMethod>
  ): [TReturn | undefined, UseQueryResult<TReturn, unknown>]
}

export interface MutationFunction<TMethod extends AsyncFunction, TReturn = Awaited<ReturnType<TMethod>>>{
  (
    options?: MutationOptions<TMethod>
  ): [(data: Parameters<TMethod>[0]) => Promise<TReturn>, UseMutationResult<TReturn, unknown>, QueryClient]
}