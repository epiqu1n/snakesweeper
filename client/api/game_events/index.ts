import { createMutationHook } from '../queryFactory';
import { STATS } from '../queryKeys';
import { postGameStart } from './methods';

export * from './methods';

export const usePostGameStart = createMutationHook(STATS, postGameStart);
