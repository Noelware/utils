/*
 * 🌸 @noelware/utils: Noelware's utilities package to not repeat code in our TypeScript projects.
 * Copyright (c) 2021-2023 Noelware <team@noelware.org>
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

import { tryRequire } from './functions';
import { isBrowser } from './constants';
import { lazy } from './Lazy';

const now = lazy(() =>
    isBrowser
        ? Date.now
        : (() => {
              try {
                  const { performance } = tryRequire<typeof import('perf_hooks')>('perf_hooks');
                  return performance.now;
              } catch {
                  try {
                      const { performance } = tryRequire<typeof import('node:perf_hooks')>('node:perf_hooks');
                      return performance.now;
                  } catch {
                      return Date.now;
                  }
              }
          })()
);

/**
 * The current state of a {@link Stopwatch}.
 */
export const StopwatchState = {
    UNINIT: -1,
    STARTED: 0,
    ENDED: 1
} as const;

/**
 * Represents a generic stopwatch utility to calculate in millisecond-precision. In Node.js
 * environments, this will use the [`performance.now`](https://nodejs.org/api/perf_hooks.html#performancenow) API and in browsers, `Date.now` is
 * used as a replacement.
 *
 * ## Example
 * ```ts
 * import { Stopwatch } from '@noelware/utils';
 *
 * const watch = new Stopwatch();
 * watch.start(); // watch has started
 * doSomethingExpensive();
 *
 * const endedAt = watch.stop();
 * console.log(`Took ${endedAt} to do something expensive!`);
 * ```
 */
export class Stopwatch {
    #currentState: keyof typeof StopwatchState = 'UNINIT';
    #startTime?: number;
    #endTime?: number;
    #now: () => number = now.get();

    /**
     * Creates a new {@link Stopwatch} that is started automatically
     * when you call this method.
     *
     * @return A new {@link Stopwatch} method.
     */
    static createStarted() {
        const self = new Stopwatch();
        self.start();

        return self;
    }

    /**
     * Measures a synchronous function and returns the time it took
     * to call the method.
     *
     * @param func The function to measure.
     * @returns The time it took to execute the function.
     */
    static measure(func: () => void) {
        const self = Stopwatch.createStarted();
        func();

        return self.stop();
    }

    /**
     * Measures an asynchronous function and returns the time it took
     * to call the method.
     *
     * @param func The async function to measure.
     * @returns The time it took to execute the function.
     */
    static async measureAsync(func: () => Promise<void>) {
        const self = Stopwatch.createStarted();
        await func();

        return self.stop();
    }

    /**
     * Starts the stopwatch.
     * @throws A {@link Error} if the current state of this {@link Stopwatch} is STARTED.
     */
    start() {
        if (this.#currentState === 'STARTED') {
            throw new Error('Cannot start an already started Stopwatch.');
        }

        this.#startTime = this.#now();
        this.#currentState = 'STARTED';
    }

    /**
     * Stops this {@link Stopwatch} and returns a pretty time of the measured
     * time.
     *
     * @throws A {@link Error} if the current state of this {@link Stopwatch} was not STARTED.
     * @return Pretty time of the measured time.
     */
    stop() {
        if (this.#currentState !== 'STARTED') {
            throw new Error(`Cannot stop a stopwatch on state [${this.#currentState}]`);
        }

        this.#endTime = this.#now() - this.#startTime!;
        this.#currentState = 'ENDED';

        if (this.#endTime > 1000) return `${this.#endTime.toFixed(1)}s`;
        if (this.#endTime > 1) return `${this.#endTime.toFixed(1)}ms`;
        return `${this.#endTime.toFixed(1)}µs`;
    }

    /**
     * Resets the start time of this {@link Stopwatch}.
     */
    reset() {
        if (['STARTED', 'UNINIT'].includes(this.#currentState)) {
            throw new Error('Cannot reset an already started or uninitialized stopwatch!');
        }

        this.#currentState = 'UNINIT';
        this.start();
    }
}
