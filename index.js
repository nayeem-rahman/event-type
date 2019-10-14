export default class {
  _onDispatch = ({argument, next}) => {};
  _next = new Promise(resolve => this._onDispatch = resolve);

  /* Resolve with the argument carried in the next event. */
  async listen() {
    return this._next.then(({argument}) => argument);
  }

  /* Trigger an event carrying the given argument. */
  dispatch(argument = null) {
    const onDispatch = this._onDispatch;
    this._next = new Promise(resolve => this._onDispatch = resolve);
    onDispatch({argument, next: this._next});
  }

  /* Iterate asynchronously through the arguments carried in future events,
     starting with the next. */
  async * [Symbol.asyncIterator]() {
    let next = this._next;
    while (true) {
      const {argument, next: newNext} = await next;
      next = newNext;
      yield argument;
    }
  }
}
