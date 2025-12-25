/**
 * Utility functions for conditional dependency loading
 * Handles dynamic imports and error handling for web-specific libraries
 */

import { Platform } from "react-native";

export interface DependencyLoadResult<T> {
  success: boolean;
  module?: T;
  error?: string;
}

/**
 * Safely loads a module with error handling
 * @param importFn Function that returns a dynamic import promise
 * @returns Promise with load result
 */
export async function safeLoadModule<T>(
  importFn: () => Promise<T>
): Promise<DependencyLoadResult<T>> {
  try {
    const module = await importFn();
    return {
      success: true,
      module,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Loads web-specific dependencies only on web platform
 * @param dependencies Array of dependency loaders
 * @returns Promise with all load results
 */
export async function loadWebDependencies<T extends Record<string, any>>(
  dependencies: Record<keyof T, () => Promise<any>>
): Promise<{ [K in keyof T]?: DependencyLoadResult<T[K]> }> {
  // Only attempt to load on web platform
  if (Platform.OS !== "web") {
    return {};
  }

  const results: { [K in keyof T]?: DependencyLoadResult<T[K]> } = {};

  await Promise.all(
    Object.entries(dependencies).map(async ([key, loader]) => {
      results[key as keyof T] = await safeLoadModule(loader);
    })
  );

  return results;
}

/**
 * Checks if a dependency was loaded successfully
 * @param result Dependency load result
 * @returns True if module loaded successfully
 */
export function isDependencyLoaded<T>(
  result?: DependencyLoadResult<T>
): result is DependencyLoadResult<T> & { module: T } {
  return result?.success === true && result.module !== undefined;
}

/**
 * Gets error messages from failed dependency loads
 * @param results Dependency load results
 * @returns Array of error messages
 */
export function getDependencyErrors<T extends Record<string, any>>(results: {
  [K in keyof T]?: DependencyLoadResult<any>;
}): string[] {
  return Object.values(results)
    .filter((result) => result && !result.success)
    .map((result) => result!.error!)
    .filter(Boolean);
}

/**
 * Creates a fallback handler for missing dependencies
 * @param componentName Name of the component for error messages
 * @returns Error handler function
 */
export function createDependencyFallback(componentName: string) {
  return (error: string) => {
    console.warn(`${componentName}: ${error}`);
    return null;
  };
}
