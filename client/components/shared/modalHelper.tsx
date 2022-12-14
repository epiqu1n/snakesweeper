import { createRoot } from 'react-dom/client';
import InputModal, { InputFields, InputValues } from './InputModal';

export default function showInputModal<TInputs extends InputFields>(
  message: string,
  inputFields: TInputs = {} as TInputs
): Promise<{ values: InputValues<TInputs> | undefined, cancelled: boolean }> {
  return new Promise((resolve) => {
    // Create a mini React app
    const container = document.createElement('div');
    container.className = 'input-modal-container'
    const modalRoot = createRoot(container);

    /** Removes the modal and resolves the promise */
    function closeModal(values: InputValues<TInputs> | undefined, cancelled = false) {
      modalRoot.unmount();
      container.remove();
      resolve({ values, cancelled });
    }

    /** @type {Parameters<InputModal>[0]['inputs']} */

    const modal = (
      <InputModal
        message={message}
        onSubmit={(inputs) => closeModal(inputs)} onCancel={() => closeModal(undefined, true)}
        inputs={inputFields}
      />
    );

    document.body.append(container);
    modalRoot.render(modal);
  });
}
