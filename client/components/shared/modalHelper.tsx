import { createRoot } from 'react-dom/client';
import InputModal, { InputFields } from './InputModal';

export default function showInputModal(message: string, inputFields: InputFields): Promise<{ inputs: InputFields | undefined, cancelled: boolean }> {
  return new Promise((resolve) => {
    // Create a mini React app
    const container = document.createElement('div');
    container.className = 'input-modal-container'
    const modalRoot = createRoot(container);

    /** Removes the modal and resolves the promise */
    function closeModal(inputs: InputFields | undefined, cancelled = false) {
      modalRoot.unmount();
      container.remove();
      resolve({ inputs, cancelled });
    }

    const modal = (
      <InputModal
        message={message}
        onSubmit={(input) => closeModal(input)} onCancel={() => closeModal(undefined, true)}
        inputs={inputFields}
      />
    );

    document.body.append(container);
    modalRoot.render(modal);
  });
}
