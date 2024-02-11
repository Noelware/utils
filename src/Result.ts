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

const kErr = Symbol.for('$hoshi::result::error$');
const kVal = Symbol.for('$hoshi::result::value$');

/**
 * Represents a Rust-style [`Result`] interface. This mirrors some APIs that Rust's Result
 * type brings in. You use the {@link ok `ok()`} and {@link err `err()`} methods to create
 * an instance of this instead of calling `new Result(...)`.
 *
 * @since 2.5.0
 *
 * [`Result`]: https://doc.rust-lang.org/nightly/core/result/enum.Result.html
 */
export class Result<T, E> {
    [kVal]: T | undefined;
    [kErr]: E | undefined;

    /**
     * Returns a `boolean` to indicate if this {@link Result `Result`} is a successful variant.
     *
     * @since 2.5.0
     *
     * ## Example
     * ```ts
     * import { ok } from '@noelware/utils/result';
     *
     * const variant = ok(42);
     * variant.isOk();
     * // => true
     * ```
     */
    isOk() {
        return this[kVal] !== undefined;
    }

    /**
     * Returns a `boolean` to indicate if this {@link Result `Result`} is a error variant.
     *
     * @since 2.5.0
     *
     * ## Example
     * ```ts
     * import { err } from '@noelware/utils/result';
     *
     * const variant = err(new Error('some error'));
     * variant.isErr();
     * // => true
     * ```
     */
    isErr() {
        return this[kErr] !== undefined;
    }

    /**
     * Maps this `Result<T, E>` into a `Result<U, E>` with applying a function
     * to the contained Ok variant, leaving the Err variant untouched. Use the
     * {@link Result.mapErr `Result#mapErr`} method for the opposite.
     *
     * @since 2.5.0
     *
     * ## Example
     * ```ts
     * import { ok } from '@noelware/utils/result';
     *
     * const variant = ok(42);
     * //    ^? (Result<number, never>)
     *
     * const myNewVariant = variant.map((value) => value * 2);
     * myNewVariant.inspect((value) => {
     *     console.log(`my new value is ${value}`);
     *     // will print 'my new value is 84'
     * });
     * ```
     *
     * @param fn Function to converse `T` ~> `U`.
     * @returns a new {@link Result `Result`} type of the contained `U` passed in and the `E` variant being
     *          left alone.
     */
    map<U>(fn: (value: T) => U): Result<U, E> {
        if (this.isErr()) {
            return err(this[kErr]!);
        }

        return ok(fn(this[kVal]!));
    }

    /**
     * Inverse of {@link Result.map `Result#map`} but only containing the Err variant rather
     * than the Ok variant.
     *
     * @since 2.5.0
     *
     * ## Example
     * ```ts
     * import { err } from '@noelware/utils/result';
     *
     * const variant = err(new Error('weow'));
     * //    ^? (Result<never, Error>)
     *
     * const myNewVariant = variant.mapErr((value) => value.message);
     * myNewVariant.inspectErr((value) => {
     *     console.log(`my new value is \`${value}\``);
     *     // will print 'my new value is `weow`'
     * });
     * ```
     *
     * @param fn Function to converse `E` ~> `F`.
     * @returns a new {@link Result `Result`} type of the contained `F` passed in and the `T` variant being
     *          left alone.
     */
    mapErr<F>(fn: (error: E) => F): Result<T, F> {
        if (this.isOk()) {
            return ok(this[kVal]!);
        }

        return err(fn(this[kErr]!));
    }

    /**
     * Calls the provided `fn` closure to inspect the Ok variant. If this is a Err variant,
     * this will do nothing.
     *
     * @since 2.5.0
     *
     * ## Examples
     * ```ts
     * import { ok } from 'hoshi';
     *
     * let x = ok(4)
     *     .inspect((value) => console.log(`original: ${value}`))
     *     .map((value) => value * 3)
     *     .unwrap();
     * ```
     *
     * @param fn Closure to call to inspect the `value`.
     * @returns this instance to chain methods
     */
    inspect(fn: (value: T) => void) {
        if (this.isOk()) {
            fn(this[kVal]!);
        }

        return this;
    }

    /**
     * Inverse of {@link Result.inspect `Result.inspect`} but inspects the given Err variant.
     *
     * @param fn Closure to call to inspect the `value`.
     * @since 2.5.0
     * @returns this instance to chain methods
     */
    inspectErr(fn: (value: E) => void) {
        if (this.isErr()) {
            fn(this[kErr]!);
        }

        return this;
    }

    /**
     * Unwrap a Ok variant's value or throws an exception if this Result
     * was a error variant.
     *
     * @since 2.5.0
     */
    unwrap() {
        if (this.isErr()) {
            throw new Error(`called Result#unwrap() on an \`Err\` value: ${this[kErr]}`);
        }

        return this[kVal]!;
    }

    /**
     * Unwrap a Err variant's value or throws an exception if this Result
     * was a ok variant.
     *
     * @since 2.5.0
     */
    unwrapErr() {
        if (this.isOk()) {
            throw new Error('called Result#unwrapErr() on a `Ok` value');
        }

        return this[kErr]!;
    }

    /**
     * Unwrap a Ok variant's value or throws an exception (with a custom message) if this Result
     * was a error variant.
     *
     * @param message The message to throw
     * @since 2.5.0
     */
    expect(message: string) {
        if (this.isErr()) {
            throw new Error(`${message}: ${this[kErr]}`);
        }

        return this[kVal]!;
    }
}

/**
 * Creates a new Ok variant of a Result.
 * @param value the inner value to contain
 * @since 2.5.0
 */
export function ok<T, E>(value: T): Result<T, E> {
    const result = new Result<T, never>();
    result[kVal] = value;

    return result;
}

/**
 * Creates a new Err variant of a Result.
 * @param error the inner error to contain
 * @since 2.5.0
 */
export function err<T, E>(error: E): Result<T, E> {
    const result = new Result<never, E>();
    result[kErr] = error;

    return result;
}

/**
 * Wraps a `try {}` block to return a {@link Result `Result`} from a synchronous method. Use the
 * {@link triAsync `triAsync`} method for asynchronous usage.
 *
 * @param value Closure to converse to a `T`.
 * @param error When a rejection occurs in a promise, this closure will converse `err` ~> `E`.
 * @since 2.5.0
 * @returns A {@link Result `Result`} that contains the result of the try block.
 */
export function tri<T, E>(value: () => T, error: (err: unknown) => E): Result<T, E> {
    try {
        const val = value();
        return ok(val);
    } catch (ex) {
        const err_ = error(ex);
        return err(err_);
    }
}

/**
 * Wraps a `try {}` block to return a {@link Result `Result`} from an asynchronous method. Use the
 * {@link tri `tri`} method for synchronous usage.
 *
 * ## Example
 * ```ts
 * import { assertIsError } from '@noelware/utils';
 * import { triAsync } from '@noelware/utils/result';
 * import { readFile } from 'node:fs/promises';
 *
 * const contents = await triAsync(
 *     () => readFile('/tmp/source.txt'),
 *     (err) => {
 *         assertIsError(err);
 *         return err;
 *     }
 * );
 *
 * // => Result<string, Error>
 * ```
 *
 * @param value Closure to collect a `Promise<T>`.
 * @param onReject When a rejection occurs in a promise, this closure will converse `err` ~> `E`.
 * @since 2.5.0
 * @returns A promise that contains a {@link Result `Result`}. This will never throw an exception.
 */
export async function triAsync<T, E>(value: () => Promise<T>, onReject: (err: unknown) => E): Promise<Result<T, E>> {
    try {
        const val = await value();
        return ok(val);
    } catch (ex) {
        const err_ = onReject(err);
        return err(err_);
    }
}
