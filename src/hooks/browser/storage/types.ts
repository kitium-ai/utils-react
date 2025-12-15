/**
 * Storage hook types and interfaces
 */

/**
 * Type of storage to use
 */
export type StorageType = 'localStorage' | 'sessionStorage';

/**
 * Function to set storage value, supporting both value and updater function pattern
 */
export type SetStorageValue<T> = (value: T | ((previousValue: T) => T)) => void;

/**
 * Return type for storage hooks
 */
export type StorageHookResult<T> = [T, SetStorageValue<T>];

/**
 * Configuration for storage hook factory
 */
export type StorageConfig = {
  type: StorageType;
  key: string;
};
