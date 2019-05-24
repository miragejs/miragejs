# Mocking GUIDs

Some applications use GUIDs (or UUIDs) instead of auto-incrementing integers as identifiers for their models.

Mirage supports the ability to overwrite how its database assigns IDs to new records via the `IdentityManager` class. You can generate model-specific managers or an application-wide manager to customize how your database behaves.

To generate a new identity manager, use the blueprint:

```
ember generate mirage-identity-manager <application|modelName>
```

A custom identity manager must implement these methods:

- `fetch`, which must return an identifier not used yet.
- `set`, which is called with an `id` of a record being insert in mirage's database.
- `reset`, which should reset database to initial state.

Here's an example implementation for an identity manager that mocks GUIDs:

```js
import { v4 as getUuid } from "ember-uuid";

export default class {
  constructor() {
    this.ids = new Set();
  }

  // Returns a new unused unique identifier.
  fetch() {
    let uuid = getUuid();
    while (this.ids.has(uuid)) {
      uuid = getUuid();
    }

    this.ids.add(uuid);

    return uuid;
  }

  // Registers an identifier as used. Must throw if identifier is already used.
  set(id) {
    if (this.ids.has(id)) {
      throw new Error(`ID ${id} has already been used.`);
    }

    this.ids.add(id);
  }

  // Resets all used identifiers to unused.
  reset() {
    this.ids.clear();
  }
}
```
