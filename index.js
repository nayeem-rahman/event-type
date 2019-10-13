export default class {
  #onDispatch = () => {};
  #next = new Promise(resolve => this.#onDispatch = resolve);

  /* Resolve with the argument carried in the next event. */
  async listen() {
    return this.#next.then(({argument}) => argument);
  }

  /* Trigger an event carrying the given argument. */
  dispatch(argument = null) {
    const onDispatch = this.#onDispatch;
    this.#next = new Promise(resolve => this.#onDispatch = resolve);
    onDispatch({argument, next: this.#next});
  }

  /* Iterate asynchronously through the arguments carried in future events,
     starting with the next. */
  async * [Symbol.asyncIterator]() {
    let next = this.#next;
    while (true) {
      const {argument, next: newNext} = await next;
      next = newNext;
      yield argument;
    }
  }
}
