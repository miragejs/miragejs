# Identity managers

By default Mirage uses auto incremental numbers starting with `1` as IDs for records. This could be customized by implementing *identity managers*.

An identity manager is a class generating unique identifiers. You could provide a custom identity manager per application and per model.

A custom identity manager must implement these methods:

- `fetch`, which must return an identifier not used yet.
- `set`, which is called with an `id` of a record being insert in mirage's database.
- `reset`, which should reset database to initial state.

Mirage provides a blueprint to generate custom identity managers: `ember generate mirage-identity-manager <application|modelName>`

For example an identity manager mocking UUIDs would look like this:

```js
import { v4 as getUuid } from "ember-uuid";

export default class {
  constructor() {
    this.ids = new Set();
  }

  /**
   * Returns an unique identifier.
   *
   * @method fetch
   * @param {Object} data Records attributes hash
   * @return {String} Unique identifier
   * @public
   */
  fetch() {
    let uuid = getUuid();
    while (this.ids.has(uuid)) {
      uuid = getUuid();
    }

    this.ids.add(uuid);

    return uuid;
  }

  /**
   * Register an identifier.
   * Must throw if identifier is already used.
   *
   * @method set
   * @param {String|Number} id
   * @public
   */
  set(id) {
    if (this.ids.has(id)) {
      throw new Error(`ID ${id} is inuse.`);
    }

    this.ids.add(id);
  }

  /**
   * Reset identity manager.
   *
   * @method reset
   * @public
   */
  reset() {
    this.ids.clear();
  }
}
```
