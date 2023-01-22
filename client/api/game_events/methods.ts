import { post } from '../../utils/request';

interface PostGameStartArgs {
  modeId: number
}

export async function postGameStart({ modeId }: PostGameStartArgs): Promise<void> {
  try {
    await post('/api/events', { modeId });
  } catch (err) {
    return alert('An error occurred submitting score (code: ge-m-1');
  }
}
