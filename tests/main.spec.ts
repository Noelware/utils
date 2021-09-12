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

import { join, sep } from 'path';
import * as utils from '../src';

describe('Main Utilities', () => {
  test("if a object doesn't contain null or undefined values", () => {
    const values = utils.omitUndefinedOrNull({
      key: 'uwu',
      owo: undefined,
      uwu: null,
      furry: 3621,
    });

    expect(values).not.toBeUndefined();
    expect(values).toStrictEqual({
      furry: 3621,
      key: 'uwu',
    });
  });

  test('if we receive "$PWD/docs/docs.json" in the array', async () => {
    const path = join(__dirname, '..', 'docs');
    const files = await utils.readdir(path);

    expect(files.length).toBe(16);
  });

  test('if we should be able to exclude `build` and only have .md files returned', () => {
    const files = utils.readdirSync(__dirname, {
      exclude: ['dud'],
      extensions: [/\.(spec|test).ts$/i],
    });

    expect(files.length).toBe(3);
  });

  test("if '{}' is a object", () => expect(utils.isObject({})).toBe(true));

  test("if 'null' is not a object", () => expect(utils.isObject(null)).toBe(false));

  test('checks if `x` is the default value', () => {
    const obj = {};

    // @ts-expect-error We expect this since `x` is not defined, so it'll default to 'lol'
    const value = utils.getProperty(obj, 'x', 'lol');
    expect(value).toBe('lol');
  });

  test('if `31535999527` is equal to 1 year, 3 weeks, 4 days, 23 hours, 59 minutes, and 59 seconds', () => {
    expect(utils.humanize(31535999527)).toBe('1y3w4d23h59m59s');
    expect(utils.humanize(31535999527, true)).toBe('1 year, 3 weeks, 4 days, 23 hours, 59 minutes, 59 seconds');
  });

  test('should return "Owo Uwu"', () => expect(utils.firstUpper('owo uwu')).toBe('Owo Uwu'));
});
