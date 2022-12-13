import { ChangeEventHandler, DetailedHTMLProps, InputHTMLAttributes, useEffect, useRef, useState } from 'react';
import styles from './InputModal.module.scss';

export interface InputFields {
  [name: string]: Partial<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>
}

interface InputModalProps {
  message: string,
  onSubmit: (values: InputFields) => void,
  onCancel: () => void,
  inputs?: InputFields
}

export default function InputModal({ message, onSubmit, onCancel, inputs }: InputModalProps) {
  const dialogRef = useRef(null) as React.MutableRefObject<HTMLDialogElement | null>;

  const [ inputFields, setInputFields ] = useState<InputFields>({});

  /** Assigns state */
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputEl = event.target;
    const { name, value, type, checked } = inputEl;
    
    setInputFields((prev) => {
      const newInputFields = { ...prev };

      if (type === 'checkbox') newInputFields[name].checked = checked;
      else newInputFields[name].value = value;
      return newInputFields;
    });
  };

  /** Handle new or removed input fields */
  useEffect(() => {
    const newInputFields: InputFields = {};
    if (inputs) {
      for (const name in inputs) {
        newInputFields[name] = inputFields[name] || inputs[name];
        newInputFields[name].value = newInputFields[name].value || ''; // Force component to be controlled, even without initial value
      }
    }
    else {
      // If there are no provided inputs, only show the "default" input
      newInputFields['__default'] = { value: '' };
    }

    setInputFields(newInputFields);
  }, [inputs]);

  /** Map input fields to elements */
  const inputEls = Object.entries(inputFields).map(([ name, input ], i) => {
    // Default input is a text fgield with no label
    if (name === '__default') return <input name={name} {...input} onChange={handleInputChange} key={`InputModal_${name}`} autoFocus />;
    else return (
      <div className={styles.fieldGroup} key={`InputModal_${name}`}>
        <label htmlFor={name}>{name}</label>
        <input name={name} {...input} onChange={handleInputChange} autoFocus={i === 0} />
      </div>
    );
  });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, [dialogRef]);

  return (
    <dialog ref={dialogRef} onCancel={onCancel} className={styles.modal}>
      <div className={styles.closeButton} onClick={onCancel}>X</div>
      <pre>{message}</pre>
      <form onSubmit={() => onSubmit(inputFields)} method='dialog'>
        {/* <input value={input} onChange={(event) => setInput(event.target.value)} autoFocus /> */}
        {inputEls}
        <input type='submit' value='Submit' />
      </form>
    </dialog>
  );
}
