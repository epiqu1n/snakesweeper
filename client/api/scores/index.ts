import { createInfiniteQueryHook, createMutationHook, createQueryHook } from '../queryFactory';
import { getScores, postScore } from './methods';

const SCORES = 'scores';

export const useGetScores = createQueryHook(SCORES, getScores);
export const useGetScoresInfinite = createInfiniteQueryHook(SCORES, getScores);
export const usePostScores = createMutationHook(SCORES, postScore);
