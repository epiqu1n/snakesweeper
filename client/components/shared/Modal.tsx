import { MouseEventHandler, MutableRefObject, ReactNode, useEffect, useRef } from 'react';
import styles from './InputModal.module.scss';

interface ModalProps {
  message: ReactNode,
  onCancel: () => void,
  children?: ReactNode
}

export default function Modal({ message, children, onCancel }: ModalProps) {
  const dialogRef = useRef(null) as MutableRefObject<HTMLDialogElement | null>;

  /** Modal click handler -> cancels the modal if a click occurs outside of the modal */
  const handleDialogClick: MouseEventHandler<HTMLDialogElement> = ({ target }) => {
    if (!(target instanceof HTMLElement) || target.matches(`.${styles.content}, .${styles.content} *`)) return;
    onCancel();
  };

  useEffect(() => {
    dialogRef.current?.showModal();
  }, [dialogRef]);

  return (
    <dialog ref={dialogRef} className={styles.dialog} onCancel={onCancel} onClick={handleDialogClick}>
      <div className={styles.content}>
        <div className={styles.closeButton} onClick={onCancel}>X</div>
        <div className={styles.title}>{message}</div>
        {children}
      </div>
    </dialog>
  );
}
