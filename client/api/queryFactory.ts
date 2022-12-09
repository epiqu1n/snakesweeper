import { QueryClient, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult, useQuery, useQueryClient, useMutation, UseInfiniteQueryOptions, UseInfiniteQueryResult, useInfiniteQuery } from '@tanstack/react-query';

/// Query Hook
export interface QueryApiMethod<TArgs, TReturn> {
  (
    args?: TArgs
  ): Promise<TReturn>
}

export interface QueryHook<TArgs = unknown, TReturn = unknown> {
  (
    args?: TArgs,
    options?: UseQueryOptions<TReturn, unknown, TReturn>
  ): [
    data: TReturn | undefined,
    query: UseQueryResult<TReturn, unknown>
  ]
}

/** Creates a wrapper for the useQuery hook for simpler implementation. Returns the data and the query result. */
export function createQueryHook<TArgs, TReturn>(
  queryKeyName: string,
  queryFn: QueryApiMethod<TArgs, TReturn>
) {
  const queryHook: QueryHook<TArgs, TReturn> = (args, options) => {
    const query = useQuery({
      queryKey: [queryKeyName, args],
      queryFn: () => queryFn(args),
      ...options
    });
    return [ query.data, query ];
  }

  return queryHook;
}


/// Infinite Query Hook
export interface InfiniteQueryParams {
  limit: number,
  offset: number
}

export interface QueryInfiniteApiMethod<TArgs extends Partial<InfiniteQueryParams>, TReturn> {
  (
    args: TArgs
  ): Promise<TReturn[]>
}

export interface InfiniteQueryHook<TArgs extends InfiniteQueryParams, TReturn> {
  (
    args: TArgs,
    options?: UseInfiniteQueryOptions<TReturn[], unknown, TReturn[], TReturn[]>
  ): [
    mergedData: TReturn[] | undefined,
    query: UseInfiniteQueryResult<TReturn[], unknown>
  ]
}

/** Creates a wrapper for the useInfiniteQuery hook for simpler implementation. Returns the merged data and the query result. */
export function createInfiniteQueryHook<TArgs extends Partial<InfiniteQueryParams>, TReturn>(
  queryKeyName: string,
  queryFn: QueryInfiniteApiMethod<TArgs, TReturn>
) {
  const infiniteQueryHook: InfiniteQueryHook<TArgs & InfiniteQueryParams, TReturn> = (args, options) => {
    const query = useInfiniteQuery({
      queryKey: [queryKeyName, args],
      queryFn: () => queryFn(args),
      ...options
    });
    const mergedData = query.data?.pages.reduce((acc, curr) => acc.concat(curr), []);
    return [ mergedData, query ];
  }

  return infiniteQueryHook;
}


/// Mutation Hook
export type MutationApiMethod<TBody extends Object, TReturn> = (body: TBody) => Promise<TReturn>;

export interface MutationHook<TBody = Object, TReturn = unknown> {
  (
    options?: UseMutationOptions<TReturn, unknown, TBody, unknown>
  ): [
    actionFn: (data: TBody) => Promise<TReturn>,
    mutation: UseMutationResult<TReturn, unknown, TBody, unknown>,
    queryClient: QueryClient
  ]
}

/**
 * Creates a wrapper for the useMutation hook for simpler implementation.
 * Returns the action method for triggering a mutation, the mutation result, and the query client.  
 * Defaults to invalidating the associated query on success, but can be overridden by providing an `onSuccess` method in the `options` parameter.
 */
export function createMutationHook<TBody extends Object, TReturn>(
  queryKeyName: string,
  mutationFn: MutationApiMethod<TBody, TReturn>
) {
  const mutationHook: MutationHook<TBody, TReturn> = (options) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
      mutationKey: [queryKeyName],
      mutationFn: mutationFn,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKeyName] }),
      ...options
    });
  
    const action = (data: TBody) => mutation.mutateAsync(data);
    return [ action, mutation, queryClient ];
  }

  return mutationHook;
}
