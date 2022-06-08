import * as React from 'react';

type ScoreRowProps = {
  time_seconds: number,
  username: string,
  submitted_at: string // Datetime
};

export default function ScoreRow(props: ScoreRowProps) {
  const { username, time_seconds, submitted_at } = props;
  return (
    <div>
      <span>{username}</span>&emsp;
      <span>{time_seconds}s</span>&emsp;
      <span>{new Date(submitted_at).toLocaleString()}</span>
    </div>
  );
}