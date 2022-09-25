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

import { afterAll, assert, beforeAll, expect, test, describe } from 'vitest';
import * as utils from '../src';
import { join } from 'path';

test('constants', () => {
  expect(utils.isNode).toBe(true);
  expect(utils.isBrowser).toBe(false);

  assert.deepEqual(
    {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday'
    },
    utils.DaysInWeek
  );

  assert.deepEqual(
    {
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
      11: 'December'
    },
    utils.Months
  );
});

describe('EventBus', () => {
  let eventBus: utils.EventBus | undefined = undefined;
  beforeAll(() => {
    eventBus = new utils.EventBus();
  });

  afterAll(() => {
    eventBus = undefined;
  });

  test('can emit', () => {
    let emitted = false;
    eventBus!.on('owo', () => {
      emitted = true;
    });

    eventBus!.emit('owo');
    expect(emitted).toBeTruthy();
  });

  test('has 1 event listener', () => {
    expect(eventBus!.size()).toBe(1);
  });

  test('has 101 event listeners on the `owo` event', () => {
    for (let i = 0; i < 100; i++) {
      eventBus!.on('owo', () => {
        // noop
      });
    }

    expect(eventBus!.size()).toBe(1);
    expect(eventBus!.size('owo')).toBe(101);
  });

  test('should be no listeners with `once` method', () => {
    let hasRemoved = false;
    eventBus!.once('uwu', () => {
      hasRemoved = true;
    });

    expect(eventBus!.size()).toBe(2);
    eventBus!.emit('uwu');

    expect(hasRemoved).toBeTruthy();
    expect(eventBus!.size()).toBe(2);
    expect(eventBus!.size('uwu')).toBe(0);
  });

  test('should now have zero event listeners', () => {
    eventBus!.removeAllListeners();
    expect(eventBus!.size()).toBe(0);
    expect(eventBus!.size('owo')).toBe(0);
  });
});

test('Lazy', () => {
  const lazyValue = new utils.Lazy(() => 1);
  expect(lazyValue.get()).toBe(1);
  expect(lazyValue.get()).toBe(1);
});

describe('functions', () => {
  test('hasOwnProperty', () => {
    const obj: Record<string, any> = { uno: 1, dos: 2 };
    expect(utils.hasOwnProperty(obj, 'uno')).toBeTruthy();
    expect(utils.hasOwnProperty(obj, 'dos')).toBeTruthy();
    expect(utils.hasOwnProperty(obj, 'hssksidjslksdjd')).toBeFalsy();
  });

  test('property', () => {
    const obj: Record<string, any> = { uno: 1, dos: 2 };
    expect(utils.property(obj, 'uno', 9999)).toBe(1);
    expect(utils.property(obj, 'dos', 999)).toBe(2);
    expect(utils.property(obj, 'nkfdkdfkfdsjfl', 727)).toBe(727);
  });

  test('isObject', () => {
    expect(utils.isObject({ owo: true })).toBeTruthy();
    expect(utils.isObject(null)).toBeFalsy();
    expect(utils.isObject(['owo'])).toBeFalsy();
    expect(utils.isObject('nmdskdsdsla;dlsdsks;aldksdl;ad')).toBeFalsy();
  });

  test('pluralize', () => {
    expect(utils.pluralize('second', 2)).toBe('2 seconds');
    expect(utils.pluralize('second', 1)).toBe('1 second');
  });

  test('titleCase', () => {
    expect(utils.titleCase('everything is owo')).toBe('Everything Is Owo');
  });

  test('shouldExclude', () => {
    expect(utils.shouldExclude(['h', 'i', 'j'], (i) => i === 'h')).toBeTruthy();
    expect(utils.shouldExclude(['a', 'b', 'c'], (i) => i.length === 3)).toBeFalsy();
  });

  test('readdirSync', () => {
    const files = utils.readdirSync(join(process.cwd(), '.yarn', 'releases'));
    expect(files).toMatchInlineSnapshot(`
      [
        "${process.cwd()}/.yarn/releases/yarn-3.2.3.cjs",
      ]
    `);
  });

  test('omitUndefinedOrNull', () => {
    const items = { a: undefined, b: null, c: 'a', d: 1, e: true };
    expect(utils.omitUndefinedOrNull(items)).toMatchInlineSnapshot(`
      {
        "c": "a",
        "d": 1,
        "e": true,
      }
    `);
  });

  test('assertIsError', () => {
    function isError(value: unknown) {
      try {
        utils.assertIsError(value);
        return true;
      } catch (e) {
        throw e;
      }
    }

    expect(() => isError('abcd')).toThrowError();
    expect(() => isError(new Error('beep boop'))).not.toThrowError();
  });
});
