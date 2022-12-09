import { QueryClient, QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult, useQuery, MutationFunction, useQueryClient, useMutation } from '@tanstack/react-query';

export type QueryApiMethod<TReturn> = (filters?: Record<string, unknown>) => Promise<TReturn>;

export interface QueryHook<TReturn = unknown, TArgs = unknown> {
  (
    args?: TArgs,
    options?: UseQueryOptions<TReturn, unknown, TReturn>
  ): [
    data: TReturn | undefined,
    query: UseQueryResult<TReturn, unknown>
  ]
}

/** Creates a wrapper for the useQuery hook for simpler implementation. Returns the data and the query result. */
export function createQueryHook<TReturn>(
  queryKeyName: string,
  queryFn: QueryApiMethod<TReturn>
) {
  const queryHook: QueryHook<TReturn, Parameters<typeof queryFn>[0]> = (args, options) => {
    const query = useQuery({
      queryKey: [queryKeyName, args],
      queryFn: () => queryFn(args),
      ...options
    });
    return [ query.data, query ];
  }

  return queryHook;
}

export type MutationApiMethod<TReturn, TBody extends Object> = (body: TBody) => Promise<TReturn>;

export interface MutationHook<TReturn = unknown, TBody = Object> {
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
export function createMutationHook<TReturn, TBody extends Object>(
  queryKeyName: string,
  mutationFn: MutationApiMethod<TReturn, TBody>
) {
  const mutationHook: MutationHook<TReturn, TBody> = (options) => {
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
