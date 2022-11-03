import { createRoot } from 'react-dom/client';
import InputModal from './InputModal';

export default function promptModal(message: string): Promise<{ input: string | undefined, cancelled: boolean }> {
  return new Promise((resolve) => {
    // Create a mini React app
    const container = document.createElement('div');
    container.className = 'input-modal-container'
    const modalRoot = createRoot(container);

    /** Removes the modal and resolves the promise */
    function closeModal(input: string | undefined, cancelled = false) {
      modalRoot.unmount();
      container.remove();
      resolve({ input, cancelled });
    }

    const modal = (
      <InputModal
        message={message}
        onSubmit={(input) => closeModal(input)} onCancel={() => closeModal(undefined, true)}
      />
    );

    document.body.append(container);
    modalRoot.render(modal);
  });
}