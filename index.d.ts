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
  /**
   * Filters from it's [Conidition] in the specified [Base] object
   */
  type FilterFlags<Base, Condition> = { [K in keyof Base]: Base[K] extends Condition ? K : never };

  /**
   * Get the keys of the [Base]'s allowed names
   */
  type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

  /**
   * Object of the picked values of the [Base] from the [Condition].
   */
  type FilterOut<Base, Condition> = Pick<Base, keyof Omit<Base, AllowedNames<Base, Condition>>>;

  /** Nestly make all properties in a object not required */
  type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]>; }

  /** Represents [[T]] as a Promise or not. */
  type MaybePromise<T> = T | Promise<T>;

  /** Filters out `undefined` or `null` from a object */
  type OmitUndefinedOrNull<T> = FilterOut<T, null | undefined>;

  /** Type alias for getting the return type of a constructor as a type */
  type ConstructorReturnType<T> = T extends new (...args: any[]) => infer P
  ? P
  : T extends Ctor<infer P>
    ? P
    : unknown;

  /** Nestly make all properties in a object required */
  type DeepRequired<T> = {
    [P in keyof T]-?: DeepRequired<T[P]>;
  };

  /**
   * Returns all the keys of [T] as the specified [Sep]erator.
   */
  // credit: Ben - https://github.com/Benricheson101
  type ObjectKeysWithSeperator<
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
  type KeyToPropType<
    T extends Record<string, any>,
    Obj extends ObjectKeysWithSeperator<T, Sep>,
    Sep extends string = '.'
  > = Obj extends `${infer First}${Sep}${infer Rest}`
    ? KeyToPropType<T[First], Rest extends ObjectKeysWithSeperator<T[First], Sep> ? Rest : never, Sep>
      : Obj extends `${infer First}`
        ? T[First]
        : T;

  /**
   * Interface to mark [[T]] as a `import('...')`/`require('...')` value.
   * If this module is a CJS import, it'll just return the class, so you can do:
   *
   * ```ts
   * const mod: Ctor<SomeModuleClass> = await import('some-module');
   * const c = new mod();
   * ```
   *
   * If this module is a ESM import, you must use `new mod.default` for `export default`
   * statements; `new mod.<some_class>` for `export ...`; or `new mod();` for `export =`
   * statements.
   */
  interface Ctor<T> {
    new (...args: any[]): T;

    default?: Ctor<T> & { default: never };
  }
}

declare namespace utils {
  type FilterFlags<Base, Condition> = { [K in keyof Base]: Base[K] extends Condition ? K : never };
  type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
  type FilterOut<Base, Condition> = Pick<Base, keyof Omit<Base, AllowedNames<Base, Condition>>>;

  /** Nestly make all properties in a object not required */
  type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]>; }

  /** Represents [[T]] as a Promise or not. */
  type MaybePromise<T> = T | Promise<T>;

  /** Filters out `undefined` or `null` from a object */
  type OmitUndefinedOrNull<T> = FilterOut<T, null | undefined>;

  /** Type alias for getting the return type of a constructor as a type */
  type ConstructorReturnType<T> = T extends new (...args: any[]) => infer P
  ? P
  : T extends Ctor<infer P>
    ? P
    : unknown;

  /**
   * Interface to mark [[T]] as a `import('...')`/`require('...')` value.
   * If this module is a CJS import, it'll just return the class, so you can do:
   *
   * ```ts
   * const mod: Ctor<SomeModuleClass> = await import('some-module');
   * const c = new mod();
   * ```
   *
   * If this module is a ESM import, you must use `new mod.default` for `export default`
   * statements; `new mod.<some_class>` for `export ...`; or `new mod();` for `export =`
   * statements.
   */
  interface Ctor<T> {
    new (...args: any[]): T;

    default?: Ctor<T> & { default: never };
  }

  /**
   * Options for `utils.readdir` or `utils.readdirSync`
   */
  interface ReaddirOptions {
    /** List of extensions to check for */
    extensions?: (string | RegExp)[];

    /** List of directories to exclude or files */
    exclude?: (string | RegExp)[];
  }

  /** Represents a generic listener */
  type Listener = (...args: any[]) => void;

  /** Represents the arguments if `L` is a `Listener` or just use `any` if not */
  type ListenerArgs<L> = L extends Listener ? Parameters<L> : any[];

  /** Represents a object of a default EventBus' listeners */
  interface EventBusMap {
    [P: string]: Listener;
  }

  /** Nestly make all properties in a object required */
  type DeepRequired<T> = {
    [P in keyof T]-?: DeepRequired<T[P]>;
  };

  /**
   * Returns all the keys of [T] as the specified [Sep]erator.
   */
  // credit: Ben - https://github.com/Benricheson101
  type ObjectKeysWithSeperator<
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
  type KeyToPropType<
    T extends Record<string, any>,
    Obj extends ObjectKeysWithSeperator<T, Sep>,
    Sep extends string = '.'
  > = Obj extends `${infer First}${Sep}${infer Rest}`
    ? KeyToPropType<T[First], Rest extends ObjectKeysWithSeperator<T[First], Sep> ? Rest : never, Sep>
      : Obj extends `${infer First}`
        ? T[First]
        : T;

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
  export function isObject<T extends object>(x: unknown): x is T;

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

  /**
   * Represents a EventBus, an emittion tool to pass down data from one component to another
   */
  export class EventBus<O extends object = EventBusMap> {
    /**
     * Emits a new event from the callstack
     * @param event The event to emit
     * @param args Any additional arguments to push
     * @returns A boolean value if it exists or not
     */
    emit<K extends keyof O>(event: K, ...args: ListenerArgs<O[K]>): boolean;

    /**
     * Sets the maximum amount of listeners to append
     *
     * @param count The max size to use, If value `-1` is used, it'll
     * be infinite and might lead to callstack errors.
     *
     * @returns This instance to chain methods
     */
    setMaxListeners(count: number): this;

    /**
     * Pushes a new event to the callstack
     *
     * @param event The event to push
     * @param listener The listener function
     * @returns This instance to chain methods
     */
    on<K extends keyof O>(event: K, listener: O[K]): this;

    /**
     * Pushes a new event to the callstack and removes it after
     * it has been emitted from the parent component.
     *
     * @param event The event to push
     * @param listener The listener function
     * @returns This instance to chain methods
     */
    once<K extends keyof O>(event: K, listener: O[K]): this;

    /**
     * Pushes a event's specific listener from the callstack.
     * @param event The event to remove
     * @param listener The listener callback function
     * @returns This instance to chain methods
     */
    removeListener<K extends keyof O>(event: K, listener: O[K]): boolean;

    /**
     * Returns how many listeners a event has
     * @param event The event to lookup
     * @returns A number of how many concurrent listeners are in
     */
    size<K extends keyof O>(event: K): number;

    /**
     * Returns how many events are in this EventBus component
     */
    size(): number;

    /**
     * Removes all listeners from this EventBus component
     */
    removeAllListeners(): this;

    /**
     * @inheritdoc [module:utils/EventBus.on; include_params=true]
     */
    addListener<K extends keyof O>(event: K, listener: O[K]): this;
  }

  /**
   * Utility stopwatch for calculating duration on asynchronous execution
   */
  export class Stopwatch {
    /**
     * Returns the symbol duration
     * @param type The calculation
     */
    public symbolOf(type: number): string;

    /**
     * Restarts this [[Stopwatch]]
     */
    public restart(): void;

    /**
     * Starts this [[Stopwatch]], calling this function
     * twice will result in a `SyntaxError`.
     */
    public start(): void;

    /**
     * Ends this [[Stopwatch]] and returns the duration
     * as a string. Calling this function without calling
     * `Stopwatch#start` will error with a `TypeError`.
     */
    public end(): string;
  }
}

export = utils;
export as namespace utils;
