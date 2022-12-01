import styles from './ScoreRow.module.scss';

type ScoreRowProps = {
  time_seconds: number,
  username: string,
  submitted_at: Date // Datetime
};

export default function ScoreRow(props: ScoreRowProps) {
  const { username, time_seconds, submitted_at: date } = props;

  // Format date
  const month = date.toLocaleString('default', { month: 'short' });
  const isCurrentYear = (date.getFullYear() === ((new Date()).getFullYear()));
  const year = (isCurrentYear ? '' : `, ${date.getFullYear()}`);
  const dateStr = `${month} ${date.getDate()}${year}`;

  // Format time
  const rawHours = date.getHours(), rawMinutes = date.getMinutes();
  const hours = ( rawHours === 0 ? 12 : rawHours > 12 ? rawHours % 12 : rawHours );
  const minutes = ( rawMinutes < 10 ? `0${rawMinutes}` : rawMinutes);
  const amPm = ( date.getHours() < 12 ? 'am' : 'pm' );
  const timeZone = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' })?.split(' ')[2] || '';
  const timeStr = `${hours}:${minutes}${amPm} ${timeZone}`;

  return (
    <tr className={styles['row']}>
      <td className={styles['username']}>{username}</td>
      <td align='center'>{time_seconds}s</td>
      <td align='right' className={styles['date']}>{dateStr}</td>
      <td className={styles['date']}>at {timeStr}</td>
    </tr>
  );
}