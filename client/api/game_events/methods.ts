import { post } from '../../utils/request';

interface PostGameStartArgs {
  modeId: number
}

export async function postGameStart({ modeId }: PostGameStartArgs): Promise<void> {
  try {
    await post('/api/events/start', { modeId });
  } catch (err) {
    return alert('An error occurred reporting game start event (code: ge-m-1)');
  }
}
