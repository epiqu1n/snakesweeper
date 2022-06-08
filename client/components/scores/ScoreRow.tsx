import * as React from 'react';

type ScoreRowProps = {
  time_seconds: number,
  username: string,
  submitted_at: string // Datetime
};

export default function ScoreRow(props: ScoreRowProps) {
  const { username, time_seconds, submitted_at } = props;
  return (
    <tr>
      <td>{username}</td>&emsp;
      <td>{time_seconds}s</td>&emsp;
      <td>{new Date(submitted_at).toLocaleString()}</td>
    </tr>
  );
}