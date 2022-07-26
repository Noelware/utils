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

/** Options for the readdir/readdirSync functions. */
export interface ReaddirOptions {
  /** A list of extensions to only output. This can be an array of strings or a regular expression. */
  extensions?: (string | RegExp)[];

  /** A list of excluded files. This can be an array of strings or a regular expression. */
  exclude?: (string | RegExp)[];
}

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
 * Decouples an array's type from {@link __T__}. Returns the inferred
 * type or `never` if it's not an Array.
 */
// eslint-disable-next-line
export type DecoupleArray<T> = T extends Array<infer U> ? U : never;
