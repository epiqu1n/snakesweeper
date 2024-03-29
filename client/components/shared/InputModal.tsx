import { ChangeEventHandler, DetailedHTMLProps, FormEventHandler, InputHTMLAttributes, ReactNode, useEffect, useState } from 'react';
import styles from './InputModal.module.scss';
import Modal from './Modal';

interface InputModalProps<TInputs extends InputFields> {
  message: ReactNode,
  onSubmit: (values: InputValues<TInputs>) => void,
  onCancel: () => void,
  inputs?: TInputs,
  error?: string
}

export default function InputModal<TInputs extends InputFields>({ message, onSubmit, onCancel, inputs, error }: InputModalProps<TInputs>) {
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

  /** Handles form submission -> maps relevant information from inputs and invokes `onSubmit` prop with that info */
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const outputs: Record<string, unknown> = {};
    for (const name in inputFields) {
      outputs[name] = inputFields[name].type === 'checkbox' ? inputFields[name].checked : inputFields[name].value;
    }
    onSubmit(outputs as InputValues<TInputs>);
  };

  /** Handle new or removed input fields */
  useEffect(() => {
    setInputFields((prevFields) => {
      const newInputFields: InputFields = {};
      if (inputs) {
        for (const name in inputs) {
          newInputFields[name] = prevFields[name] || inputs[name];
          // Force component to be controlled if no initial value was provided
          if (inputs[name].type === 'checkbox') newInputFields[name].checked = newInputFields[name].checked || false;
          else newInputFields[name].value = newInputFields[name].value || '';
        }
      }
      else {
        // If there are no provided inputs, only show the "default" input
        newInputFields['__default'] = { value: '' };
      }
      return newInputFields;
    });
  }, [inputs]);

  /** Map input fields to elements */
  const inputEls = Object.entries(inputFields).map(([ name, input ], i) => {
    // Default input is a text fgield with no label
    if (name === '__default') return <input name={name} {...input} onChange={handleInputChange} key={`InputModal_${name}`} autoFocus />;
    else return (
      <div className={styles.fieldGroup} key={`InputModal_${name}`}>
        <label htmlFor={name}>{input.label || name.slice(0, 1).toUpperCase() + name.slice(1)}</label>
        <input name={name} {...input} onChange={handleInputChange} autoFocus={i === 0} />
      </div>
    );
  });

  return (
    <Modal message={message} onCancel={onCancel}>
      <form onSubmit={handleSubmit} method='dialog' className={styles.form}>
        {/* <input value={input} onChange={(event) => setInput(event.target.value)} autoFocus /> */}
        {inputEls}
        {error && <p className={styles.errors}>{error}</p>}
        <input type='submit' value='Submit' />
      </form>
    </Modal>
  );
}

// Hard-coded because the React HTMLInputTypeAttribute also allows for `(string & {})` which is messing with type autocompletion
type HTMLInputType = ('button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week');

export type HTMLInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & { type: HTMLInputType };

export interface InputFields {
  [name: string]: Partial<HTMLInputProps> & { label?: ReactNode }
}

export type InputValues<TInputs extends InputFields> = {
  [Key in keyof TInputs]: TInputs[Key]['type'] extends 'checkbox' ? boolean : string
}
