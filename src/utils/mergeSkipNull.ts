import { mergeWith } from 'lodash';

/**
 * Overrides target's properties with source's properties, while skipping nulls.
 * @param target Target object
 * @param source Source to merge from
 * @returns Object representing the merge
 */
export function mergeSkipUndefined<T, S>(target: T, source: S): T & S {
    return mergeWith(target, source, (a, b) => b === null || b === undefined ? a : undefined);
}