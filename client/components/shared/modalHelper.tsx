import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import InputModal from './InputModal';

export default function promptModal<RT>(message: string): Promise<{ input: string | undefined, cancelled: boolean }> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    const modalRoot = createRoot(container);

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

// Return a Promise
  // Create a new React root on the document body
  // Render the modal within the root
  // When the "yes" or "no" buttons are clicked:
    // The promise resolves with a boolean for if the dialog was confirmed ("yes")
    // The modal is unrendered
    // Unmount the React app