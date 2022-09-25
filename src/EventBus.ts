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

/** Represents a generic listener function. */
export type Listener = (...args: unknown[]) => void;

/** Extracts the arguments of a specific {@link Listener}. */
export type ExtractListenerArguments<L> = L extends Listener ? Parameters<L> : any[];

/** Represents a generic definition of the type-safe events in a {@link EventBus}. */
export type GenericEventBusMap = Record<string, Listener>;

export interface EventEmitterLike {
  addListener(event: string, listener: (...args: any[]) => void): any;
  emit(event: string, ...args: unknown[]): any;
  once(event: string, listener: (...args: any[]) => void): any;
  on(event: string, listener: (...args: any[]) => void): any;
}

/**
 * Checks if {@link emitter} is a event emitter or not.
 * @param emitter The unknown property.
 * @returns Asserts that {@link emitter} is {@link EventEmitterLike}.
 */
export function isEventEmitterLike<T extends EventEmitterLike>(emitter: unknown): emitter is T {
  const conditions = [
    typeof emitter === 'object' && !Array.isArray(emitter) && emitter !== null,
    typeof (emitter as EventEmitterLike).addListener === 'function',
    typeof (emitter as EventEmitterLike).emit === 'function',
    typeof (emitter as EventEmitterLike).once === 'function',
    typeof (emitter as EventEmitterLike).on === 'function'
  ];

  return conditions.every((t) => t === true);
}

/**
 * Represents an extended event emitter.
 */
export class EventBus<Map extends {} = GenericEventBusMap> {
  ['constructor']!: typeof EventBus;
  #maxListenerSize = 250;
  #listeners: Record<keyof Map, Listener[]> = {} as any;

  /**
   * Emits a event from the listener callstack
   * @param event The event to be emitted.
   * @param args The arguments for the event.
   */
  emit<E extends keyof Map>(event: E, ...args: ExtractListenerArguments<Map[E]>) {
    if (!this.#listeners.hasOwnProperty(event)) return;

    const listeners = this.#listeners[event];
    if (!listeners.length) return;
    for (const listener of listeners) {
      listener(...args);
    }
  }

  /**
   * Sets the max listeners to {@link count}. Use `-1` if you wish to not have
   * a max listener count, this is dangerous.
   * @param count The amount of listeners this {@link EventBus} can hold.
   * @returns This {@link EventBus} instance to chain methods
   */
  setMaxListeners(count: number) {
    this.#maxListenerSize = count;
    return this;
  }

  /**
   * Adds a new listener to the event's callstack.
   * @param event The event to add
   * @param listener The listener callback when it is emitted.
   * @return This {@link EventBus} instance to chain methods
   */
  on<E extends keyof Map>(event: E, listener: Map[E]) {
    const listeners = this.#listeners[event] ?? [];
    if (this.#maxListenerSize !== -1 && listeners.length > this.#maxListenerSize)
      throw new RangeError(`Reached the maximum amount of listeners to append on event [${String(event)}]`);

    listeners.push(listener as any);
    this.#listeners[event] = listeners;

    return this;
  }

  /**
   * Adds a new listener to the event's callstack that will be emitted once and removed
   * from the callstack.
   * @param event The event to register
   * @param listener The listener callback when it is emitted.
   * @return This {@link EventBus} instance to chain methods
   */
  once<E extends keyof Map>(event: E, listener: Map[E]) {
    const listenerToEmit = (...args: unknown[]) => {
      (listener as any)(...args);
      this.removeListener(event, listenerToEmit as unknown as Map[E]);
    };

    return this.on(event, listenerToEmit as unknown as Map[E]);
  }

  /**
   * Removes a callback listener from the event's callstack.
   * @param event The event
   * @param listener The listener callback that was registered.
   */
  removeListener<E extends keyof Map>(event: E, listener: Map[E]) {
    if (!this.#listeners.hasOwnProperty(event)) return false;

    const listeners = this.#listeners[event as string];
    if (!listeners.length) return;

    const index = listeners.indexOf(listener as any);
    if (index !== -1) listeners.splice(index, 1);

    this.#listeners[event] = listeners;
  }

  /**
   * Returns how many event callbacks have been registered.
   * @param event The event to check
   */
  size<E extends keyof Map>(event: E): number;

  /**
   * Returns how many events have been registered.
   */
  size(): number;
  size(event?: string) {
    if (event !== undefined) {
      const listeners = this.#listeners[event] ?? [];
      return listeners.length;
    }

    return Object.keys(this.#listeners).length;
  }

  /**
   * Removes all the listeners from this {@link EventBus}
   * @return This {@link EventBus} instance to chain methods
   */
  removeAllListeners() {
    this.#listeners = {} as any;
    return this;
  }

  /** @inheritdoc EventBus.on */
  addListener<E extends keyof Map>(event: E, listener: Map[E]) {
    return this.on(event, listener);
  }
}
