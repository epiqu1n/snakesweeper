import { UserScore } from '../../types/Scores';

export interface ScoresFilters {
  modeId?: number,
  limit?: number,
  offset?: number
}
export async function getScores(filters: ScoresFilters = {}) {
  let url = '/api/scores';
  const params = Object.entries(filters).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join("&");
  if (params.length > 0) url += `?${params}`;
  
  const data = await fetch(url).then(res => res.json());
  if (data.error) {
    console.error(data.error);
    throw new Error('An error occurred getting top scores:', data.error);
  }

  const scores: UserScore[] = data.scores.map((score: UserScore & { submitted_at: string }) => ({
    ...score,
    submitted_at: new Date(score.submitted_at)
  }));
  return scores;
}

export interface NewScoreData {
  username: string,
  score: number,
  modeId: number
}
export async function postScore(data: NewScoreData) {
  const { username, score, modeId } = data;
  try {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, score, modeId })
    })
    .then(res => res.json());

    if (response.error) throw new Error(response.error);
    return 2;
  } catch (err) {
    console.error(err);
    throw new Error('Uh oh, something went wrong submitting your score D:');
  }
}
