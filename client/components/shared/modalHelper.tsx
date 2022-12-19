import { ReactNode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { postLogin } from '../../api/auth/methods';
import { UserInfo } from '../../contexts/userContext';
import InputModal, { InputFields, InputValues } from './InputModal';

/// `showFormModal` method signatures
/**
 * Displays a modal with a form, using the specified input fields.
 * When the form is submitted, the modal will close and this method will resolve with
 * the keys and values from the form.
 */
export default function showFormModal<TInputs extends InputFields>(
  message: ReactNode,
  inputFields: TInputs,
  onSubmit?: undefined
): Promise<{ values?: InputValues<TInputs>, cancelled: boolean }>;

/**
 * Displays a modal with a form, using the specified input fields.
 * When the provided `onSubmit` method returns or resolves with a value,
 * the modal will close and this method will resolve with the value yielded by `onSubmit`.
 * If the method throws an error, the error message is appended to the form.
 */
export default function showFormModal<TInputs extends InputFields, TResponse>(
  message: ReactNode,
  inputFields: TInputs,
  onSubmit: (values: InputValues<TInputs>) => Promise<TResponse>
): Promise<{ response?: TResponse, cancelled: boolean }>;


/// `showFormModal` method implementation
export default function showFormModal<TInputs extends InputFields, TResponse>(
  message: ReactNode,
  inputFields: TInputs = {} as TInputs,
  /**
   * Method to run when the form is submitted. The modal will close and resolve when the method returns any truthy value.
   * If the method throws an error, the error message is appended to the form.
   */
  onSubmit: unknown
): unknown {
  return new Promise((resolve) => {
    function ModalWrapper() {
      const [ error, setError ] = useState<string | undefined>();
      
      /** Handles submission of the form and closes the modal if successful */
      async function handleSubmit(inputs: InputValues<TInputs>) {
        if (typeof onSubmit === 'function') {
          try {
            const response = await onSubmit(inputs);
            if (response) {
              closeModal();
              resolve({ response, cancelled: false });
            }
          } catch (err) {
            setError(err?.message || err);
          }
        }
        else {
          closeModal();
          resolve({ values: inputs, cancelled: false })
        }
      }

      /** Handles cancellation of the form, closing the modal and resolving with `cancelled: true` */
      function handleCancel() {
        closeModal();
        resolve({ cancelled: true });
      }

      return (
        <InputModal
          message={message}
          onSubmit={handleSubmit} onCancel={handleCancel}
          inputs={inputFields}
          error={error}
        />
      );
    }
  
    // Create a mini React app
    const container = document.createElement('div');
    container.className = 'input-modal-container'
    const modalRoot = createRoot(container);
  
    /** Removes the modal */
    function closeModal() {
      modalRoot.unmount();
      container.remove();
    }

    document.body.append(container);
    modalRoot.render(<ModalWrapper />);
  });
}

export async function showLoginModal(): Promise<{ userInfo: UserInfo | undefined, cancelled: boolean }> {
  const { response: userInfo, cancelled } = await showFormModal(
    <h3>Log in</h3>,
    {
    'username': {},
    'password': { type: "password" }
    },
    postLogin
  );
  
  return { userInfo, cancelled };
}
