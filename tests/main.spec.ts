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

import { describe, expect, test } from 'bun:test';
import * as utils from '../src';

test('Constants', () => {
    expect(utils.isNode).toBeTrue();
    expect(utils.isBrowser).toBeFalse();
});

test('Lazy', () => {
    const lazyValue = utils.lazy(() => 1);
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

    test('isObject', () => {
        expect(utils.isObject({ owo: true })).toBeTruthy();
        expect(utils.isObject(null)).toBeFalsy();
        expect(utils.isObject(['owo'])).toBeFalsy();
        expect(utils.isObject('nmdskdsdsla;dlsdsks;aldksdl;ad')).toBeFalsy();
    });

    test('omitUndefinedOrNull', () => {
        const items = { a: undefined, b: null, c: 'a', d: 1, e: true };
        expect(utils.omitUndefinedOrNull(items)).toMatchSnapshot();
    });

    test('assertIsError', () => {
        function isError<E extends { message: string }>(value: unknown): asserts value is E {
            try {
                utils.assertIsError(value);
            } catch (e) {
                throw e;
            }
        }

        expect(() => isError('abcd')).toThrow();
        expect(() => isError({ message: 'weow' })).not.toThrow();
        expect(() => isError(new Error('beep boop'))).not.toThrow();
    });
});
