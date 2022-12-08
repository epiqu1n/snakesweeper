import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MutationFunction, MutationOptions, QueryFunction, QueryOptions } from '../ApiTypes';
import { getScores, postScore, NewScoreData } from './methods';

const SCORES = 'scores';

export const useGetScores: QueryFunction<typeof getScores> = (filters = {}, options) => {
  const scoresQuery = useQuery({
    ...options,
    queryKey: [SCORES, filters],
    queryFn: () => getScores(filters),
    refetchInterval: false
  });
  return [ scoresQuery.data, scoresQuery ];
}

export const usePostScores: MutationFunction<typeof postScore> = (options) => {
  const queryClient = useQueryClient();
  const scoreMutation = useMutation({
    ...options,
    mutationKey: [SCORES],
    mutationFn: postScore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scores'] })
  });

  const post = (data: Parameters<typeof postScore>[0]) => scoreMutation.mutateAsync(data);
  return [ post, scoreMutation, queryClient ];
}