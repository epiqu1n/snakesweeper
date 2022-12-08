import { QueryKey, useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { UserScore } from '../../types/Scores';
import { getScores, postScore, PostScoreArgs } from './methods';

const SCORES = 'scores';

type MutationOptions<TArgs> = UseMutationOptions<void, unknown, TArgs, unknown>;
type QueryOptions<TData> = UseQueryOptions<TData, unknown, TData, QueryKey>;

export function useGetScores(filters: Parameters<typeof getScores>[0] = {}, options?: QueryOptions<UserScore[]>) {
  const scoresQuery = useQuery({
    ...options,
    queryKey: [SCORES, filters],
    queryFn: () => getScores(filters),
    refetchInterval: false
  });
  return [scoresQuery.data, scoresQuery] as const;
}

export function usePostScores(options?: MutationOptions<PostScoreArgs>) {
  const queryClient = useQueryClient();
  const scoreMutation = useMutation({
    ...options,
    mutationKey: [SCORES],
    mutationFn: postScore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scores'] })
  });

  const post = (data: PostScoreArgs) => scoreMutation.mutateAsync(data);
  return post;
}