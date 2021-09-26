/**
 * Copyright (c) 2021 Noel
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

import { readdirSync as fsReaddir, lstatSync as fsStat } from 'fs';
import { join, extname } from 'path';
import { deprecate } from './deprecate';
import os from 'os';

const { version: pkgVersion } = require('../package.json');

export { deprecate };
export { default as EventBus } from './EventBus';
export { default as Stopwatch } from './Stopwatch';

/**
 * Represents a exported file
 */
export interface Ctor<T> {
  /**
   * Constructs a new instance of [T]
   * @param args Any additional arguments, if any
   */
  new (...args: any[]): T;

  /**
   * Returns the default export of [T], if it was a ES module
   */
  default?: Ctor<T> & { default: never };
}

// Credit: https://github.com/DonovanDMC
export type FilterFlags<Base, Condition> = { [K in keyof Base]: Base[K] extends Condition ? K : never };
export type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
export type FilterOut<Base, Condition> = Pick<Base, keyof Omit<Base, AllowedNames<Base, Condition>>>;

export interface ReaddirOptions {
  /** List of extensions to check for */
  extensions?: (string | RegExp)[];

  /** List of directories to exclude or files */
  exclude?: (string | RegExp)[];
}

/** Type to omit out `undefined` or `null` */
export type OmitUndefinedOrNull<T> = FilterOut<T, null | undefined>;

/** Type alias for getting the return type of a constructor as a type */
export type ConstructorReturnType<T> = T extends new (...args: any[]) => infer P
  ? P
  : T extends Ctor<infer P>
  ? P
  : unknown;

/** Nestly make all properties in a object not required */
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

/** Represents [[T]] as a Promise or not. */
export type MaybePromise<T> = T | Promise<T>;

/** Nestly make all properties in a object required */
export type DeepRequired<T> = {
  [P in keyof T]-?: DeepRequired<T[P]>;
};

/**
 * Returns all the keys of [T] as the specified [Sep]erator.
 */
// credit: Ben - https://github.com/Benricheson101
export type ObjectKeysWithSeperator<
  T extends Record<string, any>,
  Sep extends string = '.',
  Keys extends keyof T = keyof T
> = Keys extends string
  ? T[Keys] extends any[]
    ? Keys
    : T[Keys] extends object
    ? `${Keys}${Sep}${ObjectKeysWithSeperator<T[Keys], Sep>}`
    : Keys
  : never;

/**
 * Returns all the keys from the [Obj]ect as a seperated object
 */
// credit: Ben - https://github.com/Benricheson101
export type KeyToPropType<
  T extends Record<string, any>,
  Obj extends ObjectKeysWithSeperator<T, Sep>,
  Sep extends string = '.'
> = Obj extends `${infer First}${Sep}${infer Rest}`
  ? KeyToPropType<T[First], Rest extends ObjectKeysWithSeperator<T[First], Sep> ? Rest : never, Sep>
  : Obj extends `${infer First}`
  ? T[First]
  : T;

/**
 * Returns a object from a nested object that can be used
 * for dot notation
 */
export type DotNotation<T extends Record<string, unknown>, Keys extends string> = KeyToPropType<
  T,
  ObjectKeysWithSeperator<T, '.', Keys>
>;

/**
 * Decouples a Promise's type from {@link __T__}. Returns the inferred
 * type or `never` if it's not a Promise.
 */
export type DecouplePromise<T> = T extends Promise<infer U> ? U : never;

/**
 * Decouples an array's type from {@link __T__}. Returns the inferred
 * type or `never` if it's not an Array.
 */
// eslint-disable-next-line
export type DecoupleArray<T> = T extends Array<infer U> ? U : never;

/**
 * Returns the network information from the {@link getExternalNetwork} function.
 */
export interface NetworkInfo {
  /**
   * Returns the family, which can be `4` or `6`.
   */
  family: 4 | 6;

  /**
   * Returns the address of the network.
   */
  address: string;
}

/**
 * Returns the version of `@augu/utils`
 */
export const version: string = pkgVersion;

/** Months represented as 0-indexed values to the month name */
export const Months: { [month: number]: string } = {
  0: 'January',
  1: 'Feburary',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December',
};

/** The days of a week */
export const DaysInWeek: { [day: number]: string } = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

/**
 * Promisified version of `utils.readdirSync`
 * @param path The path to get all the files from
 * @param options The options to use
 * @returns An array of strings that resolve paths
 */
export async function readdir(path: string, options: ReaddirOptions = {}) {
  return new Promise<string[]>((resolve, reject) => {
    try {
      const files = readdirSync(path, options);
      resolve(files);
    } catch (ex) {
      reject(ex);
    }
  });
}

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
 * Checks if `x` is a Object or not, this exists to not
 * use `typeof x === 'object'` which is very errornous;
 * Arrays and `null` values are always returned
 * `true` from `typeof x === 'object'`
 *
 * @param x The value to check
 * @param includeJS If we should include JavaScript objects like `Date`.
 */
export function isObject<T extends object>(x: unknown, includeJS = false): x is T {
  if (includeJS) return !Array.isArray(x) && x !== null && typeof x === 'object';

  return !Array.isArray(x) && x !== null && typeof x === 'object' && !(x instanceof Date);
}

/**
 * Omits `undefined` and `null` from a object, doesn't
 * produce any side-effects.
 *
 * @param obj The object to omit from
 * @returns The omitted object
 */
export function omitUndefinedOrNull<T extends object>(obj: T) {
  return Object.keys(obj).reduce<OmitUndefinedOrNull<T>>((acc, curr) => {
    if (obj[curr] === undefined || obj[curr] === null) return acc;

    acc[curr] = obj[curr];
    return acc;
  }, {} as OmitUndefinedOrNull<T>);
}

/**
 * Omits zeros of a string for time declaration
 * @param value The value to omit zeros from
 */
export function omitZero(value: any) {
  return `0${value}`.slice(-2);
}

/**
 * Asynchronous way to halt the process for x amount of milliseconds
 *
 * Since `Promise` are macro-tasks and stuff like setTimeout, setInterval are micro-tasks,
 * the event loop will run any synchronous code first THEN all of the Promises in that code,
 * then all of the micro-tasks; so it's an endless loop of doing all 3 I described.
 *
 * Why is this important? We can basically "manipulate" the event-loop to halt a certain
 * process until another process is done, I know... I'm weird at explaining stuff.
 *
 * @param duration The amount of time to "sleep"
 * @returns An unknown Promise
 */
export function sleep(duration: number) {
  return new Promise<unknown>((resolve) => setTimeout(resolve, duration));
}

/**
 * Gets a property from a specified object, if it's null or undefined, it'll
 * replace it with the specified [defaultValue]. This ensures that we don't
 * get any nullibility when checking for values in objects and doesn't cause
 * side-effects in the long run.
 *
 * @param object The object to find
 * @param prop The property to find in the object
 * @param defaultValue The default value if it's not defined
 */
export function getProperty<T extends object, K extends keyof T>(object: T, prop: K, defaultValue: T[K]) {
  if (object === undefined || object === null) return defaultValue;
  else if (object.hasOwnProperty(prop)) return object[prop];
  else return defaultValue;
}

/**
 * Utility function to pluralize a function from a string and integer.
 * @param str The string to add a `s` to
 * @param int The number to calculate
 * @returns The string itself
 */
export function pluralize(str: string, int: number) {
  if (int === 0 || int > 1) return `${int} ${str}s`;

  return `${int} ${str}`;
}

/**
 * Humanizes a specific precise millisecond calculate to humanize
 * the duration.
 *
 * @param ms The milliseconds to calculate
 * @param long If we should add words to it or not
 * @returns The humanized date
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
 * Formats a ISO-8601-compliant date
 * @param date The date to format
 */
export function formatDate(date: string | Date = new Date()) {
  const current = date instanceof Date ? date : new Date(date);
  if (current === undefined) return '<Malformed Date>';

  const month = Months[current.getMonth()];
  const year = current.getFullYear();
  const day = current.getDate();

  const hours = omitZero(current.getHours());
  const minutes = omitZero(current.getMinutes());
  const seconds = omitZero(current.getSeconds());
  const isAM = current.getHours() <= 12;

  return `${month} ${day}, ${year} | ${hours}:${minutes}:${seconds} ${isAM ? 'AM' : 'PM'}`;
}

/**
 * Recursively get a list of files from any parent or children directories.
 *
 * `fs.readdir`/`fs.readdirSync` can do the job no problem but it doesn't
 * do it recursively, so this is a utility method to do so, with some bonus
 * stuff implemented. :)
 *
 * @param path The path to look for
 * @param options Any additional options to include
 */
export function readdirSync(path: string, options: ReaddirOptions = {}) {
  const extensions = options.extensions ?? [];
  const excludeDirs = options.exclude ?? [];

  const shouldExclude = (arr: any[], path: string) => {
    // Having no items in the array means it's disabled
    // so let's just make it false for now. :shrug:
    if (!arr.length) return false;

    if (arr.some((item) => typeof item === 'string')) return arr.includes(path);
    else if (arr.some((item) => item instanceof RegExp)) return arr.some((item: RegExp) => item.test(path));
    else throw new TypeError("`arr` didn't satisify instances of `string` and `RegExp`");
  };

  let results: string[] = [];
  const files = fsReaddir(path);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = join(path, file);

    // doesn't de-reference symbolic links
    const stats = fsStat(fullPath);
    const isFile = stats.isFile() || stats.isFIFO();

    // Check if it's a directory
    if (!isFile) {
      // Don't include the directory's children
      if (shouldExclude(excludeDirs, file)) continue;

      const files = readdirSync(fullPath, options);
      results = results.concat(files);
    } else {
      // Get the extension of the file
      const ext = extname(file);

      // Don't include any children specified
      if (shouldExclude(excludeDirs, file)) continue;

      // Don't include if it doesn't satisify the "extensions" array
      if (shouldExclude(extensions, ext)) continue;

      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Returns all the [text]'s first characters as upper case
 * @param text The text provided
 * @param delim Optional delimiter to use (default is `' '`)
 * @example
 * titleCase('i code good'); //=> I Code Good
 */
export function titleCase(text: string, delim: string = ' ') {
  return text
    .split(delim)
    .map((t) => `${t.charAt(0).toUpperCase()}${t.slice(1)}`)
    .join(' ');
}

/**
 * Returns the external networks from the OS, if any.
 * @param strictIPv4 If retriveing should only be only IPv4 interfaces.
 * @returns The first non-internal network that the user can reach.
 * @example
 * ```js
 * const { getExternalNetwork } = require('@augu/utils');
 *
 * const network = getExternalNetwork();
 * // => { address: '127.0.0.1', family: 4 }
 * ```
 */
export function getExternalNetwork(strictIPv4 = false): NetworkInfo | null {
  const interfaces = os.networkInterfaces();
  const keys = Object.keys(interfaces);

  for (let i = 0; i < keys.length; i++) {
    const interface_ = interfaces[i];
    if (!interface_) continue;

    for (let j = 0; j < interface_.length; j++) {
      const innerInterface = interface_[j];
      const family = strictIPv4 ? innerInterface.family === 'IPv4' : true;
      if (family && !innerInterface.internal)
        return {
          family: innerInterface.family === 'IPv4' ? 4 : 6,
          address: innerInterface.address,
        };
    }
  }

  return null;
}

/**
 * Returns all the [text]'s first characters as upper case
 *
 * @deprecated This method has been renamed to {@link titleCase}.
 * @param text The text provided
 * @param delim Optional delimiter to use (default is `' '`)
 * @example
 * firstUpper('i code good'); //=> I Code Good
 */
export const firstUpper = deprecate.func(titleCase);

/**
 * Deeply and recursively merges 2 objects into one.
 * @param target The target object to merge
 * @param source The source target to merge
 * @returns The {@link target} object with the {@link source} merged together.
 */
export function deepMerge<T = {}, S = T>(target: Partial<T>, source: Partial<S>): T & S {
  const mergeFn = (obj: any) => {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (isObject(prop) || Array.isArray(obj[prop])) {
          target[prop] = deepMerge(target[prop], obj[prop]);
        } else {
          target[prop] = obj[prop];
        }
      }
    }
  };

  mergeFn(source);
  return target as unknown as T & S;
}
