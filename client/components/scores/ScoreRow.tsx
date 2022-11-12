import styles from './ScoreRow.module.scss';

type ScoreRowProps = {
  time_seconds: number,
  username: string,
  submitted_at: string // Datetime
};

export default function ScoreRow(props: ScoreRowProps) {
  const { username, time_seconds, submitted_at } = props;

  // Format date
  const date = new Date(submitted_at);
  const month = date.toLocaleString('default', { month: 'short' });
  const isCurrentYear = (date.getFullYear() === ((new Date()).getFullYear()));
  const year = (isCurrentYear ? '' : `, ${date.getFullYear()}`);
  const dateStr = `${month} ${date.getDate()}${year}`;

  // Format time
  const rawHours = date.getHours();
  const hours = ( rawHours === 0 ? 12 : rawHours > 12 ? rawHours % 12 : rawHours );
  const amPm = ( date.getHours() < 12 ? 'am' : 'pm' );
  const timeZone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
  const timeStr = `${hours}:${date.getMinutes()}${amPm} ${timeZone}`;

  return (
    <tr className={styles['row']}>
      <td>{username}</td>
      <td align='center'>{time_seconds}s</td>
      <td align='right' className={styles['date']}>{month} {date.getDate()}</td>
      <td className={styles['date']}>at {timeStr}</td>
    </tr>
  );
}