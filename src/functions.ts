/*
 * 🌸 @noelware/utils: Noelware's utilities package to not repeat code in our TypeScript projects.
 * Copyright (c) 2021-2024 Noelware, LLC. <team@noelware.org>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { ReaddirOptions } from './types';
import { isBrowser } from './constants';

let cachedModules = new Map<string, object>();

/**
 * Represents a no-operation function.
 */
// eslint-disable-next-line
export const noop = () => {};

/**
 * Calculates the distance of `process.hrtime` and
 * returns the milliseconds from the duration
 *
 * @param start The start array of [seconds, nanoseconds]
 * @returns The time in milliseconds
 */
export function calculateHRTime(start: [seconds: number, nanoseconds: number]) {
    const difference = process.hrtime(start);
    return (difference[0] * 1e9 + difference[1]) / 1e6;
}

/**
 * Sleeps on the current promise for a specific amount of time.
 * @param duration The duration to sleep on.
 * @deprecated (since 2.5.0): this is not used at all
 */
export function sleep(duration: number) {
    return new Promise<unknown>((resolve) => setTimeout(resolve, duration));
}

/**
 * Returns if the key is available in the object.
 * @param obj The object to check
 * @param key The key to check if it exists.
 */
export function hasOwnProperty<T extends object, K extends keyof T = keyof T>(obj: T, key: K) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Checks if {@link obj} is a object type. This doesn't return true for arrays or `null`.
 * @param obj The object to check.
 */
export function isObject<T extends object>(obj: unknown): obj is T {
    if (Array.isArray(obj)) return false;
    if (obj === null) return false;
    if (typeof obj !== 'object') return false;

    return true;
}

/**
 * Manipulates a string's text with the first letter being uppercase and the rest
 * being untouched.
 *
 * @param text The text to use
 * @param delim The delimiter to split, defaults to a space.
 * @deprecated (since 2.5.0): this is not used at all
 */
export function titleCase(text: string, delim: string = ' ') {
    return text
        .split(delim)
        .map((t) => `${t.charAt(0).toUpperCase()}${t.slice(1)}`)
        .join(' ');
}

/**
 * Checks if the item in the data can be excluded via a predicate function.
 *
 * @param data The data array to use
 * @param predicate The predicate function to check if it can be excluded.
 * @deprecated (since 2.5.0): this is not used at all
 */
export function shouldExclude<T>(data: T[], predicate: (item: T) => boolean) {
    if (!data.length) return false;
    return data.some(predicate);
}

/**
 * Lazy evaluates a module via `require` and caches it, or returns the cached result
 * if the module was already lazily evaluated.
 *
 * @param mod The module to evaluate
 * @deprecated (since 2.5.0): this is no longer needed
 * @returns The module as {@link T}.
 */
export function tryRequire<T>(mod: string): T {
    try {
        if (cachedModules.has(mod)) return cachedModules.get(mod) as unknown as T;
        const m = require(mod);

        cachedModules.set(mod, m);
        return m;
    } catch (e) {
        assertIsError(e);

        throw new Error(`Module "${mod}" was not found. Did you install it?`, { cause: e });
    }
}

/**
 * Recursively get files from multiple directories asynchronously. Use the {@link readdir `readdir`}
 * method to do it asynchronously.
 *
 * @param path The path to look for, this can be relative or absolute.
 * @param options options to configure the output of received file paths.
 * @deprecated (since 2.5.0): please use `node:fs`'s `readdirSync` method instead.
 * @returns A list of files if in a Node.js environment, otherwise an empty array if in a browser context.
 */
export function readdirSync(path: string, options: ReaddirOptions = {}) {
    // If it is the browser, this will be a empty array since you can't read directories.
    if (isBrowser) return [];

    const extensions = hasOwnProperty(options, 'extensions') ? options.extensions || [] : [];
    const excluded = hasOwnProperty(options, 'exclude') ? options.exclude || [] : [];

    let results: string[] = [];
    const fs = tryRequire<typeof import('fs')>('fs');
    const { join } = tryRequire<typeof import('path')>('path');
    const excludePredicate = (file: import('fs').Dirent) => (item: RegExp | string) => {
        if (typeof item === 'string') return item === file.name;
        return item.test(file.name);
    };

    const files = fs.readdirSync(path, { withFileTypes: true });
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fullPath = join(path, file.name);

        const stat = fs.statSync(fullPath);
        const isFile = stat.isFile() || stat.isFIFO();
        if (isFile) {
            if (shouldExclude(excluded, excludePredicate(file))) continue;
            if (shouldExclude(extensions, excludePredicate(file))) continue;

            results.push(fullPath);
        } else {
            if (shouldExclude(excluded, excludePredicate(file))) continue;
            if (shouldExclude(extensions, excludePredicate(file))) continue;

            results = results.concat(...readdirSync(fullPath, options));
        }
    }

    return results;
}

/**
 * Recursively get files from multiple directories asynchronously. Use the {@link readdirSync `readdirSync`}
 * method to do it synchronously.
 *
 * @param path The root path to locate files from
 * @param options options to configure the output of received file paths.
 * @deprecated (since 2.5.0): Please use `node:fs/promises`'s `readdir` method instead.
 * @returns an array of absolute file paths.
 */
export function readdir(path: string, options: ReaddirOptions = {}) {
    // If it is the browser, this will be a empty array since you can't read directories.
    if (isBrowser) return Promise.resolve([]);
    return new Promise<string[]>((resolve) => {
        const results = readdirSync(path, options);
        resolve(results);
    });
}

/**
 * Omits `undefined` or `null` values from a object. This doesn't do deep omitting,
 * it will only do it at the first level.
 *
 * ## Example
 * ```ts
 * import { omitUndefinedOrNull } from '@noelware/utils';
 *
 * omitUndefinedOrNull({
 *   a: 1,
 *   b: undefined,
 *   c: {
 *     a: 1,
 *     b: undefined
 *   }
 * });
 *
 * // => { a: 1, c: { a: 1, b: undefined } }
 * ```
 *
 * @param obj The object itself
 * @returns A new object formed with the key-value pairs containing no `undefined`/`null` values.
 */
export function omitUndefinedOrNull<T extends object>(obj: T) {
    return Object.keys(obj).reduce<NonNullable<T>>((acc, curr) => {
        if (obj[curr] === undefined || obj[curr] === null) return acc;

        acc[curr] = obj[curr];
        return acc;
    }, {} as NonNullable<T>);
}

/**
 * Does an assertion that `value` is an {@link Error `Error`}. It will throw a hard error
 * if `value` is not an instance of {@link Error `Error`}.
 *
 * Since 2.5.1: Errors can now be any form of object containing a `{ message }` field inside of them. This can
 * cause a conflict with the implementation, so you can disable it with the second argument as `false`.
 *
 * @param value value given
 * @param checkObject whether or not if `value` can be an object of `{ message }` or not.
 */
export function assertIsError<E extends { message: string } = Error>(
    value: unknown,
    checkObject = true
): asserts value is E {
    if (value instanceof Error) {
        return;
    }

    if (checkObject && isObject(value)) {
        if (!hasOwnProperty<any>(value, 'message')) {
            throw new Error(
                `unable to retain given value (${JSON.stringify(value)}) as a Error (unable to validate object is an \`Error\`)`
            );
        } else {
            return;
        }
    }

    throw new Error(`unable to retain given value (${JSON.stringify(value)}) as a Error`);
}
