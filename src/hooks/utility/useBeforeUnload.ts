import { useEffect, useRef } from 'react';

import { isBrowser } from '../../utils/ssr.js';

/**
 * Hook that shows browser alert when user tries to reload or close the page
 *
 * @param enabled - Whether the hook is enabled (default: true)
 * @param message - Message to show in the alert (default: "Changes you made may not be saved.")
 *
 * @example
 * ```tsx
 * const FormComponent = () => {
 *   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
 *
 *   useBeforeUnload(hasUnsavedChanges, "You have unsaved changes. Are you sure you want to leave?");
 *
 *   return (
 *     <div>
 *       // form fields
 *     </div>
 *   );
 * };
 * ```
 */
export function useBeforeUnload(
  enabled: boolean | string = true,
  message = 'Changes you made may not be saved.'
): void {
  const finalMessage = typeof enabled === 'string' ? enabled : message;
  const isEnabled = typeof enabled === 'boolean' ? enabled : true;

  const currentMessage = useRef(finalMessage);

  // Update message ref when it changes
  useEffect(() => {
    currentMessage.current = finalMessage;
  }, [finalMessage]);

  useEffect(() => {
    if (!isEnabled || !isBrowser()) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      event.returnValue = currentMessage.current;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isEnabled]);
}
