type ScoreRowProps = {
  time_seconds: number,
  username: string,
  submitted_at: string // Datetime
};

export default function ScoreRow(props: ScoreRowProps) {
  const { username, time_seconds, submitted_at } = props;
  return (
    <tr>
      <td>{username}</td>
      <td>{time_seconds}s</td>
      <td>{new Date(submitted_at).toLocaleString()}</td>
    </tr>
  );
}