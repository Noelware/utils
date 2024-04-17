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

/**
 * Creates a new {@link Lazy} object from a function.
 *
 * Since 2.5.1: lazily functions can include arguments as well
 *
 * @param func The lazy function.
 * @returns A {@link Lazy} object.
 */
export function lazy<T, Args extends any[] = any[]>(func: (...args: Args) => T): Lazy<T, Args> {
    return new Lazy(func);
}

/**
 * Represents a state object to calculate something in a function
 * lazily and return the same output each time.
 *
 * ## Example
 * ```ts
 * import { lazy } from '@noelware/utils';
 *
 * const myExpensiveFunc = lazy(() => 42);
 * console.log(myExpensiveFunc.get()); // => 42
 * console.log(myExpensiveFunc.get()); // => 42
 * ```
 */
export class Lazy<T, Args extends any[] = any[]> {
    #cached: T | undefined = undefined;
    #func: (...args: Args) => T;

    constructor(func: (...args: Args) => T) {
        this.#func = func;
    }

    get(...args: Args) {
        return this.#cached !== undefined ? this.#cached : (this.#cached = this.#func.call(this, ...args));
    }
}
