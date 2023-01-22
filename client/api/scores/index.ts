import { createInfiniteQueryHook, createMutationHook, createQueryHook } from '../queryFactory';
import { SCORES } from '../queryKeys';
import { getScores, postScore } from './methods';

export * from './methods';

export const useGetScores = createQueryHook(SCORES, getScores);
export const useGetScoresInfinite = createInfiniteQueryHook(SCORES, getScores);
export const usePostScores = createMutationHook(SCORES, postScore);
