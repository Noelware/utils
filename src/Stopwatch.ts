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

import { tryRequire } from './functions';
import { isBrowser } from './constants';
import { lazy } from './Lazy';

const now = lazy(() =>
  isBrowser
    ? Date.now
    : (() => {
        const mark = tryRequire<typeof import('perf_hooks')>('perf_hooks');
        return mark.performance.now;
      })()
);

export class Stopwatch {
  #startTime?: number;
  #now: () => number = now.get();
  #endTime?: number;

  static createStarted() {
    const self = new Stopwatch();
    self.start();

    return self;
  }

  static measure(func: () => void) {
    const self = Stopwatch.createStarted();
    func();

    return self.stop();
  }

  static async measureAsync(func: () => Promise<void>) {
    const self = Stopwatch.createStarted();
    await func();

    return self.stop();
  }

  start() {
    if (this.#startTime !== undefined) return;
    this.#startTime = this.#now();
  }

  stop() {
    if (this.#startTime === undefined) return;
    this.#endTime = this.#now();

    if (this.#endTime > 1000) return `${this.#endTime.toFixed(1)}s`;
    if (this.#endTime > 1) return `${this.#endTime.toFixed(1)}ms`;
    return `${this.#endTime.toFixed(1)}µs`;
  }
}
