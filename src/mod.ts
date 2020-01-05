type EventEntry<T> = {
  detail: T;
  next: Promise<EventEntry<T>>;
};

const BREAK: unknown = Symbol("BREAK");

/** Represents a stream of homogeneous events, each carrying some "detail"
 * (a value of type `T`). */
export class EventType<T> {
  // eslint-disable-next-line
  private signalDispatch: (entry: EventEntry<T>) => void = () => {};
  private next: Promise<EventEntry<T>> = new Promise(
    resolve => (this.signalDispatch = resolve)
  );

  /** Get the detail carried by the next event. */
  async listen(): Promise<T> {
    const { detail } = await this.next;
    if (detail == BREAK) {
      throw new Error("The event stream was broken.");
    }
    return detail;
  }

  /** Trigger an event carrying the given detail. */
  dispatch(detail: T): void {
    const signalDispatch = this.signalDispatch;
    this.next = new Promise(resolve => (this.signalDispatch = resolve));
    signalDispatch({ detail, next: this.next });
  }

  /** Cause any pending `listen()` calls to reject and any iterators to break
   * after the last dispatched event. */
  break(): void {
    this.dispatch(BREAK as T);
  }

  /** Iterate the details carried by all events starting with the next. */
  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    let next = this.next;
    while (true) {
      const { detail, next: newNext } = await next;
      if (detail == BREAK) {
        break;
      }
      next = newNext;
      yield detail;
    }
  }
}
