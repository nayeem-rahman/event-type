import { exit } from "process";

import { EventType } from "./mod.js";

const testResults: Promise<[string, Error | null]>[] = [];

const runTest = (name: string, fn: () => void | Promise<void>): void => {
  testResults.push(
    (async (): Promise<[string, Error | null]> => {
      let error;
      try {
        await fn();
      } catch (error_) {
        error = error_;
      }
      return [name, error] as [string, Error | null];
    })()
  );
};

const assert = (predicate: boolean, message?: string): void => {
  if (!predicate) {
    throw new Error(message == null ? "" : message);
  }
};

runTest(
  "EventType.prototype.listen()",
  async (): Promise<void> => {
    const eventType = new EventType<number>();
    let heard = false;
    eventType.listen().then(n => {
      heard = true;
      assert(n == 5);
    });
    eventType.dispatch(5);
    await new Promise(r => setTimeout(r, 1));
    assert(heard);
  }
);

runTest(
  "Event.prototype[Symbol.asyncIterator]()",
  async (): Promise<void> => {
    const eventType = new EventType<number>();
    const details: number[] = [];
    (async (): Promise<void> => {
      for await (const n of eventType) {
        details.push(n);
      }
    })();
    eventType.dispatch(4);
    eventType.dispatch(9);
    eventType.dispatch(1);
    await new Promise(r => setTimeout(r, 1));
    assert(details.length == 3);
    assert(details[0] === 4);
    assert(details[1] === 9);
    assert(details[2] === 1);
  }
);

runTest(
  "EventType.prototype.break(): Listeners",
  async (): Promise<void> => {
    const eventType = new EventType<number>();
    let threw = false;
    eventType.listen().catch(() => {
      threw = true;
    });
    eventType.break();
    await new Promise(r => setTimeout(r, 1));
    assert(threw);
  }
);

runTest(
  "EventType.prototype.break(): Iterators",
  async (): Promise<void> => {
    const eventType = new EventType<number>();
    const details: number[] = [];
    let broke = false;
    (async (): Promise<void> => {
      for await (const n of eventType) {
        details.push(n);
      }
      broke = true;
    })();
    eventType.dispatch(4);
    eventType.dispatch(9);
    eventType.dispatch(1);
    eventType.break();
    await new Promise(r => setTimeout(r, 1));
    assert(broke);
    assert(details.length == 3);
    assert(details[0] === 4);
    assert(details[1] === 9);
    assert(details[2] === 1);
  }
);

Promise.all(testResults).then(testResults => {
  for (const [name, error] of testResults) {
    console.log(`${name} ... ${error == null ? "OK" : `FAIL: ${error.stack}`}`);
  }
  if (testResults.some(([, error]) => error != null)) {
    console.error("There were test failures.");
    exit(1);
  } else {
    exit(0);
  }
});
