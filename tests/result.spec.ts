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

import { Result, err, ok } from '../src/Result';
import { expect, test } from 'bun:test';

test.each<{ ok: boolean; result: Result<number, Error> }>([
    { result: ok(42), ok: true },
    { result: err(new Error()), ok: false }
])('Result.isOk()', ({ result, ok }) => expect(result.isOk()).toBe(ok));

test.each<{ err: boolean; result: Result<number, Error> }>([
    { result: ok(42), err: false },
    { result: err(new Error()), err: true }
])('Result.isErr()', ({ result, err }) => expect(result.isErr()).toBe(err));

test('Result.map', () => {
    expect(ok(42).map((val) => `number is ${val}`)).toEqual(ok('number is 42'));
});

test('Result.mapErr', () => expect(err(new Error('weow')).mapErr((err) => err.message)).toEqual(err('weow')));
test('unwrap / expect', () => {
    expect(() => err('weow').unwrap()).toThrow('called Result#unwrap() on an `Err` value: weow');
    expect(() => err('weow').expect('a dummy message')).toThrow('a dummy message: weow');
});
