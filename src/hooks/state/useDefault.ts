import { useState } from 'react';

/**
 * Hook that returns the value or a default if value is null/undefined
 *
 * @template T - The type of the value
 * @param value - The value (can be null/undefined)
 * @param defaultValue - Default value to use if value is null/undefined
 * @returns The value or defaultValue
 *
 * @example
 * ```tsx
 * const Component = ({ name }: { name?: string }) => {
 *   const displayName = useDefault(name, 'Anonymous');
 *   return <div>Hello, {displayName}</div>;
 * };
 * ```
 */
export function useDefault<T>(value: T | null | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

