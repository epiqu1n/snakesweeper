import styles from './ScoreRow.module.scss';

type ScoreRowProps = {
  time_seconds: number,
  username: string,
  submitted_at: Date // Datetime,
  position: number
};

export default function ScoreRow(props: ScoreRowProps) {
  const { username, time_seconds, submitted_at: date, position } = props;

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
      <td align='left' className={styles['name']}>
        <span className={styles['position']}>{position}. </span>
        {username}
      </td>
      <td align='center' className={styles['score']}>{time_seconds}s</td>
      <td align='center' className={styles['date']}>{dateStr} <span className={styles['symbol']}>@</span> {timeStr}</td>
    </tr>
  );
}