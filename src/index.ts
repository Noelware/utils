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

import * as fs from 'fs/promises';
import { join } from 'path';

const { version: pkgVersion } = require('../package.json');

export { default as EventBus } from './EventBus';

/**
 * Represents a exported file
 */
export interface Ctor<T> {
  /**
   * Constructs a new instance of [T]
   * @param args Any additional arguments, if any
   */
  new(...args: any[]): T;

  /**
   * Returns the default export of [T], if it was a ES module
   */
  default?: Ctor<T> & { default: never; }
}

export type OmitUndefinedOrNull<T extends object> = {
  [P in keyof T]: NonNullable<T[P]>;
}

/**
 * Returns the version of `@augu/utils`
 */
export const version: string = pkgVersion;

/**
 * Recursively get all files of a directory, even if
 * any sub-directories exist. `fs.readdir` does the job
 * done but it doesn't detect directories and places them
 * in the Array, so this is a solution for it.
 *
 * @param path The path to get all the files from
 * @returns An array of strings that resolve paths
 */
export async function readdir(path: string) {
  let results: string[] = [];
  const files = await fs.readdir(path);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const p = join(path, file);

    // doesn't de-references symbolic links
    const stats = await fs.lstat(p);
    const isFile = (stats.isFile() || stats.isFIFO());

    if (!isFile) {
      const r = await readdir(p);
      results = results.concat(r);
    } else {
      results.push(p);
    }
  }

  return results;
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
 */
export function isObject(x: unknown): x is object {
  return !Array.isArray(x) && x !== null && typeof x === 'object';
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
export function omitZero(value: string) {
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
  return new Promise<unknown>(resolve => setTimeout(resolve, duration));
}
