/*
 * 🌸 @noelware/utils: Noelware's utilities package to not repeat code in our TypeScript projects.
 * Copyright (c) 2021-2022 Noelware <team@noelware.org>
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

import type { OmitUndefinedOrNull, ReaddirOptions } from './types';

declare var window: any;

let cachedModules = new Map<string, object>();

/**
 * Returns if we are in the browser or not
 */
export const isBrowser = typeof process === 'undefined' && typeof window === 'object';

/** Returns if we are in a Node.js environment or not. */
export const isNode = typeof process !== 'undefined' && typeof window === 'undefined';

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
 */
export function sleep(duration: number) {
  return new Promise<unknown>((resolve) => setTimeout(resolve, duration));
}

/**
 * Returns if the key is available in the object.
 * @param obj The object to check
 * @param key The key to check if it exists.
 */
export function hasOwnProperty<T extends {}, K extends keyof T = keyof T>(obj: T, key: K) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Checks if {@link obj} is a object type. This doesn't return true for arrays or `null`.
 * @param obj The object to check.
 */
export function isObject<T extends {} = {}>(obj: unknown): obj is T {
  if (Array.isArray(obj)) return false;
  if (obj === null) return false;
  if (typeof obj !== 'object') return false;

  return true;
}

/**
 * Returns the property if it's found in a {@link object obj}, otherwise it defaults to the {@link default defaultValue}.
 * @param obj The object to check
 * @param key The key
 * @param defaultValue The default value, if it wasn't found
 */
export function property<T extends {}, K extends keyof T = keyof T>(obj: T, key: K, defaultValue: T[K]): T[K] {
  if (!isObject(obj)) return defaultValue;
  if (!hasOwnProperty(obj, key)) return defaultValue;
  return obj[key];
}

/**
 * Helper function to pluralize a number.
 * @param str The string to use when pluralizing the number.
 * @param value The actual number value.
 */
export function pluralize(str: string, value: number) {
  if (value === 0) return `${value} ${str}s`;
  return value >= 1.5 ? `${value} ${str}s` : `${value} ${str}`;
}

/**
 * Humanizes a duration via {@link ms} and returns the humanized version.
 * @param ms The duration to use
 * @param long If the output should be `$num $duration` (i.e, `1 year`) or not.
 */
export function humanize(ms: number, long: boolean = false) {
  const years = Math.floor(ms / 31104000000);
  const months = Math.floor((ms / 2592000000) % 12);
  const weeks = Math.floor((ms / 604800000) % 7);
  const days = Math.floor((ms / 86400000) % 30);
  const hours = Math.floor((ms / 3600000) % 24);
  const minutes = Math.floor((ms / 60000) % 60);
  const seconds = Math.floor((ms / 1000) % 60);

  const strings: string[] = [];
  if (years > 0) strings.push(long ? pluralize('year', years) : `${years}y`);
  if (months > 0) strings.push(long ? pluralize('month', months) : `${months}mo`);
  if (weeks > 0) strings.push(long ? pluralize('week', weeks) : `${weeks}w`);
  if (days > 0) strings.push(long ? pluralize('day', days) : `${days}d`);
  if (hours > 0) strings.push(long ? pluralize('hour', hours) : `${hours}h`);
  if (minutes > 0) strings.push(long ? pluralize('minute', minutes) : `${minutes}m`);
  if (seconds > 0) strings.push(long ? pluralize('second', seconds) : `${seconds}s`);

  return strings.filter(Boolean).join(long ? ', ' : '');
}

/**
 * Manipulates a string's text with the first letter being uppercase and the rest
 * being untouched.
 *
 * @param text The text to use
 * @param delim The delimiter to split, defaults to a space.
 */
export function titleCase(text: string, delim: string = ' ') {
  return text
    .split(delim)
    .map((t) => `${t.charAt(0).toUpperCase()}${t.slice(1)}`)
    .join(' ');
}

/**
 * Checks if the item in the data can be excluded via a predicate function.
 * @param data The data array to use
 * @param predicate The predicate function to check if it can be excluded.
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
 * Reads a directory's contents and returns the contents and the subdirectories' children.
 * @param path The path to look for, this can be relative or absolute.
 * @param options The {@link ReaddirOptions} options to use, if needed.
 * @returns A list of files if in a Node.js environment, otherwise an empty array if in a browser context.
 */
export function readdirSync(path: string, options: ReaddirOptions = {}) {
  // If it is the browser, this will be a empty array since you can't read directories.
  if (isBrowser) return [];

  const extensions = property(options, 'extensions', []) ?? [];
  const excluded = property(options, 'exclude', []) ?? [];

  let results: string[] = [];
  const fs = tryRequire<typeof import('fs')>('fs');
  const { join } = tryRequire<typeof import('path')>('path');
  const excludePredicate = (file: import('fs').Dirent) => (item: string | RegExp) => {
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

      results.push(file.name);
    } else {
      if (shouldExclude(excluded, excludePredicate(file))) continue;
      if (shouldExclude(extensions, excludePredicate(file))) continue;

      results = results.concat(...readdirSync(path, options));
    }
  }

  return results;
}

export function readdir(path: string, options: ReaddirOptions = {}) {
  // If it is the browser, this will be a empty array since you can't read directories.
  if (isBrowser) return Promise.resolve([]);
  return new Promise<string[]>((resolve) => {
    const results = readdirSync(path, options);
    resolve(results);
  });
}

export function omitUndefinedOrNull<T extends object>(obj: T) {
  return Object.keys(obj).reduce<OmitUndefinedOrNull<T>>((acc, curr) => {
    if (obj[curr] === undefined || obj[curr] === null) return acc;

    acc[curr] = obj[curr];
    return acc;
  }, {} as OmitUndefinedOrNull<T>);
}

export function assertIsError<E extends Error = Error>(value: unknown): asserts value is E {
  if (!(value instanceof Error)) throw new Error(`Value was not \`Error\`.`);
}
