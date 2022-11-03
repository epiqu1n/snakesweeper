import { useEffect, useRef, useState } from 'react';
import styles from './Modal.module.scss';

interface InputModalProps {
  message: string,
  onSubmit: (value: string) => void,
  onCancel: () => void
}

export default function InputModal({ message, onSubmit, onCancel }: InputModalProps) {
  const dialogRef = useRef(null) as React.MutableRefObject<HTMLDialogElement | null>;
  const [ input, setInput ] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, [dialogRef]);

  return (
    <dialog ref={dialogRef} onCancel={onCancel} className={styles.modal}>
      <div className={styles.closeButton} onClick={onCancel}>X</div>
      <pre>{message}</pre>
      <form onSubmit={() => onSubmit(input)} method='dialog'>
        <input value={input} onChange={(event) => setInput(event.target.value)} autoFocus />
        <input type='submit' value='Submit' />
      </form>
    </dialog>
  );
}