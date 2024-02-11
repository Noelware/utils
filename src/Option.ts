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

const kVal = Symbol.for('$hoshi::option::value$');

/**
 * Represents a Rust-style [`Option`] interface. This mirrors some APIs that Rust's Option
 * type brings in. You use the {@link some `some()`} and {@link none `none()`} methods to create
 * an instance of this instead of calling `new Option(...)`.
 *
 * @since 2.5.0
 *
 * ## Example
 * ```ts
 * import { some, none } from '@noelware/utils/option';
 *
 * const meaningOfLife = some(42);
 * const nil = none();
 *
 * nil.inspect(() => {});
 * // the closure is never called
 *
 * meaningOfLife.inspect(val => console.log(`value is ${val}`));
 * // the closure is called and prints 'value is 42'
 * ```
 *
 * [`Option`]: https://doc.rust-lang.org/nightly/core/option/enum.Option.html
 */
export class Option<T> {
    [kVal]: T | undefined;

    /**
     * Returns a `boolean` to indicate that this {@link Option `Option`} resolves to something
     * meaningful.
     *
     * @since 2.5.0
     *
     * ## Example
     * ```ts
     * import { some } from '@noelware/utils/option';
     *
     * const variant = some(42);
     * variant.isSome();
     * // => true
     * ```
     */
    isSome() {
        return this[kVal] !== undefined;
    }

    /**
     * Returns a `boolean` to indicate if this {@link Option `Option`} is nothing.
     *
     * @since 2.5.0
     *
     * ## Example
     * ```ts
     * import { none } from '@noelware/utils/option';
     *
     * const variant = none();
     * variant.isNone();
     * // => true
     * ```
     */
    isNone() {
        return !this.isSome();
    }

    /**
     * Maps this `Option<T>` into a `Option<U>` with applying a function
     * to the contained Some variant, leaving the None variant untouched.
     *
     * @since 2.5.0
     *
     * ## Example
     * ```ts
     * import { some } from '@noelware/utils/option';
     *
     * const variant = some(42);
     * //    ^? (Option<number>)
     *
     * const myNewVariant = variant.map((value) => value * 2);
     * myNewVariant.inspect((value) => {
     *     console.log(`my new value is ${value}`);
     *     // will print 'my new value is 84'
     * });
     * ```
     *
     * @param fn Function to converse `T` ~> `U`.
     * @returns a new {@link Option `Option`} type of the contained `U` passed in.
     */
    map<U>(fn: (value: T) => U): Option<U> {
        if (this.isSome()) {
            return some(fn(this[kVal]!));
        }

        return this as unknown as Option<U>;
    }

    /**
     * Calls the provided `fn` closure to inspect the Some variant. If this is a None variant,
     * this will do nothing.
     *
     * @since 2.5.0
     *
     * ## Examples
     * ```ts
     * import { some } from '@noelware/utils/option';
     *
     * let x = some(4)
     *     .inspect((value) => console.log(`original: ${value}`))
     *     .map((value) => value * 3)
     *     .unwrap();
     * ```
     *
     * @param fn Closure to call to inspect the `value`.
     * @returns this instance to chain methods
     */
    inspect(fn: (value: T) => void) {
        if (this.isSome()) {
            fn(this[kVal]!);
        }

        return this;
    }

    /**
     * Unwrap a Some variant's value or throws an exception if this Option
     * was a none variant.
     *
     * @since 2.5.0
     */
    unwrap(): T {
        if (this.isNone()) {
            throw new Error('called Option#unwrap() on a `None` value');
        }

        return this[kVal]!;
    }

    /**
     * Unwrap a Some variant's value or throws an exception (with a custom message) if this Option
     * was a none variant.
     *
     * @param message The message to throw
     * @since 2.5.0
     */
    expect(message: string): T {
        if (this.isNone()) {
            throw new Error(message);
        }

        return this[kVal]!;
    }
}

/**
 * Resolves a value that can represent something.
 * @param value The value to contain.
 * @since 2.5.0
 */
export function some<T>(value: T) {
    const option = new Option<T>();
    option[kVal] = value;

    return option;
}

/**
 * Creates a option that resolves nothing.
 * @since 2.5.0
 */
export function none<T>(): Option<T> {
    return new Option();
}
