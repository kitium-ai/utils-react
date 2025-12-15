/**
 * React Types Integration Hooks
 * Uses integration utilities from @kitiumai/utils-ts and @kitiumai/types 3.x
 */

import { emailUtils, idUtils, type IsoDateTimeString } from '@kitiumai/utils-ts';
import { useCallback, useMemo, useState } from 'react';

/**
 * Hook to manage branded IDs with type safety
 * Uses branded ID utilities from @kitiumai/utils-ts/integrations/types
 */
export function useBrandedId<B extends string>(
  initialId?: string,
  brand?: B
): readonly [string | undefined, (newId: string) => void] {
  const [rawId, setRawId] = useState<string | undefined>(initialId);

  const updateId = useCallback((newId: string) => {
    setRawId(newId);
  }, []);

  const brandedId = useMemo(() => {
    if (!rawId || !brand) {
      return rawId;
    }
    return idUtils.create(rawId, brand) as unknown as string;
  }, [rawId, brand]);

  return [brandedId, updateId] as const;
}

/**
 * Hook to format and manage ISO datetime strings
 */
export function useIsoDateTime(
  initialDate?: Date
): readonly [IsoDateTimeString | undefined, (date: Date) => void, () => void] {
  const [isoString, setIsoString] = useState<IsoDateTimeString | undefined>(
    initialDate ? (initialDate.toISOString() as IsoDateTimeString) : undefined
  );

  const updateDate = useCallback((date: Date) => {
    setIsoString(date.toISOString() as IsoDateTimeString);
  }, []);

  const setNow = useCallback(() => {
    setIsoString(new Date().toISOString() as IsoDateTimeString);
  }, []);

  return [isoString, updateDate, setNow] as const;
}

/**
 * Hook to validate email addresses
 * Delegates to @kitiumai/utils-ts/@kitiumai/types email validators when available
 */
export function useEmailValidator(): (email: string) => boolean {
  return useCallback((email: string): boolean => emailUtils.isValid(email), []);
}

/**
 * Hook to manage validated email state
 */
export function useValidatedEmail(
  initialEmail = ''
): readonly [
  email: string,
  setEmail: (email: string) => void,
  isValid: boolean,
  error: string | null,
] {
  const [email, setEmail] = useState(initialEmail);
  const validateEmail = useEmailValidator();

  const normalizedEmail = useMemo(() => (email ? emailUtils.normalize(email) : email), [email]);

  const isValid = useMemo(() => {
    if (!normalizedEmail) {
      return false;
    }
    return validateEmail(normalizedEmail);
  }, [normalizedEmail, validateEmail]);

  const error = useMemo(() => {
    if (!normalizedEmail) {
      return null;
    }
    return isValid ? null : 'Invalid email address';
  }, [normalizedEmail, isValid]);

  return [normalizedEmail, setEmail, isValid, error] as const;
}

/**
 * Hook for type-safe form state management
 */
export function useTypedFormState<T extends Record<string, unknown>>(
  initialState: T
): readonly [
  state: T,
  updateField: <K extends keyof T>(field: K, value: T[K]) => void,
  resetForm: () => void,
] {
  const [state, setState] = useState<T>(initialState);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setState((previous) => ({ ...previous, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return [state, updateField, resetForm] as const;
}
