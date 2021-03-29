/**
 * Copyright (c) 2021 August
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

/*
 * Global typings for `@augu/utils`.
 * You can specify it in `"types"` as so:
 *
 * ```json
 *   "compilerOptions": {
 *       [...]
 *       "types": ["@augu/utils"]
 *    }
 * ```
 */
/**  */
declare global {
  type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]>; }
  type MaybePromise<T> = T | Promise<T>;
  type FilterFlags<Base, Condition> = { [K in keyof Base]: Base[K] extends Condition ? K : never };
  type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
  type FilterOut<Base, Condition> = Pick<Base, keyof Omit<Base, AllowedNames<Base, Condition>>>;
  type OmitUndefinedOrNull<T> = FilterOut<T, null | undefined>;
  type ConstructorReturnType<T> = T extends new (...args: any[]) => infer P
  ? P
  : T extends Ctor<infer P>
    ? P
    : unknown;

  interface Ctor<T> {
    new (...args: any[]): T;

    default?: Ctor<T> & { default: never };
  }
}

declare namespace utils {
  type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]>; }
  type MaybePromise<T> = T | Promise<T>;
  type FilterFlags<Base, Condition> = { [K in keyof Base]: Base[K] extends Condition ? K : never };
  type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
  type FilterOut<Base, Condition> = Pick<Base, keyof Omit<Base, AllowedNames<Base, Condition>>>;
  type OmitUndefinedOrNull<T> = FilterOut<T, null | undefined>;
  type ConstructorReturnType<T> = T extends new (...args: any[]) => infer P
  ? P
  : T extends Ctor<infer P>
    ? P
    : unknown;

  interface Ctor<T> {
    new (...args: any[]): T;

    default?: Ctor<T> & { default: never };
  }

  interface ReaddirOptions {
    /** List of extensions to check for */
    extensions?: (string | RegExp)[];

    /** List of directories to exclude or files */
    exclude?: (string | RegExp)[];
  }

  /** Returns the version of `@augu/utils` */
  export const version: string;

  /** Months represented as 0-indexed values to the month name */
  export const Months: { [month: number]: string };

  /** The days of a week */
  export const DaysInWeek: { [day: number]: string };

  /**
   * Promisified version of `utils.readdirSync`
   * @param path The path to get all the files from
   * @param options The options to use
   * @returns An array of strings that resolve paths
   */
  export function readdir(path: string, options?: utils.ReaddirOptions): Promise<string[]>;

  /**
   * Calculates the distance of `process.hrtime` and
   * returns the milliseconds from the duration
   *
   * @param start The start array of [seconds, nanoseconds]
   * @returns The time in milliseconds
   */
  export function calculateHRTime(start: [seconds: number, nanoseconds: number]): number;

  /**
   * Checks if `x` is a Object or not, this exists to not
   * use `typeof x === 'object'` which is very errornous;
   * Arrays and `null` values are always returned
   * `true` from `typeof x === 'object'`
   *
   * @param x The value to check
   */
  export function isObject(x: unknown): x is object;

  /**
   * Omits `undefined` and `null` from a object, doesn't
   * produce any side-effects.
   *
   * @param obj The object to omit from
   * @returns The omitted object
   */
  export function omitUndefinedOrNull<T extends object>(obj: T): utils.OmitUndefinedOrNull<T>;

  /**
   * Omits zeros of a string for time declaration
   * @param value The value to omit zeros from
   */
  export function omitZero(value: any): string;

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
  export function sleep(duration: number): Promise<unknown>;

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
  export function getProperty<T extends object, K extends keyof T>(object: T, prop: T[K], defaultValue: T[K]): T[K];

  /**
   * Utility function to pluralize a function from a string and integer.
   * @param str The string to add a `s` to
   * @param int The number to calculate
   * @returns The string itself
   */
  export function pluralize(str: string, int: number): string;

  /**
   * Humanizes a specific precise millisecond calculate to humanize
   * the duration.
   *
   * @param ms The milliseconds to calculate
   * @param long If we should add words to it or not
   * @returns The humanized date
   */
  export function humanize(ms: number, long?: boolean): string;

  /**
   * Formats a ISO-8601-compliant date
   * @param date The date to format
   */
  export function formatDate(date: string | Date): string;

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
  export function readdirSync(path: string, options?: utils.ReaddirOptions): string[];

  /**
   * Returns all the [text]'s first characters as upper case
   * @param text The text provided
   * @param delim Optional delimiter to use (default is `' '`)
   * @example
   * firstUpper('i code good'); //=> I Code Good
   */
  export function firstUpper(text: string, delim?: string): string;
}

export = utils;
export as namespace utils;