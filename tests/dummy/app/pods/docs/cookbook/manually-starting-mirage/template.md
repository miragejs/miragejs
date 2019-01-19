# Manually starting Mirage

Mirage currently starts automatically (when not disabled in your application config) **in acceptance tests only**. This is because Mirage's server boots up in an Ember initializer.

You can still start a Mirage server **for your integration and unit tests** with the following workaround:

```js
// tests/integration/components/your-test.js
import { startMirage } from 'yourapp/initializers/ember-cli-mirage';

moduleForComponent('your-component', 'Integration | Component | your component', {
  integration: true,
  beforeEach() {
    this.server = startMirage();
  },
  afterEach() {
    this.server.shutdown();
  }
});
```

Some notes:

* In an Ember addon, you'll need to change the import path to `dummy/initializers/ember-cli-mirage`.
* The Mirage configuration of `urlPrefix` and `namespace` may require to be adapted when used with integration or unit tests.
