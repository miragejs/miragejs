# Customizing the inflector

When using Ember Data, you'll sometimes find yourself needing to customize the inflection rules used by your models.

For example, say you had an `Advice` model. By default, Ember's inflector pluralizes this as "advices"

```js
import { pluralize } from 'ember-inflector';

pluralize("advice"); // advices
```

Ember Data uses these inflection rules for things like building its conventional URLs. For example,

```Js
this.store.findAll('advice');
```

would result in a GET request to `/api/advices`.

Mirage also relies on the inflector for its conventions. For example, the resource Shorthand

```js
// mirage/config.js
this.resource('advice');
```

might use inflection rules to try to look up the "advices" collection or database table.

[The guides](https://guides.emberjs.com/release/models/customizing-adapters/#toc_pluralization-customization) document the best way to configure these inflection rules. At the time of this writing, here's how you'd configure the inflector to treat "advice" as an uncountable word (i.e. a word with no plural form):

```js
// app/initializers/custom-inflector-rules.js
import Inflector from 'ember-inflector';

export function initialize(/* application */) {
  const inflector = Inflector.inflector;

  // Tell the inflector that the plural of "advice" is "advice"
  inflector.uncountable('advice');
}

export default {
  name: 'custom-inflector-rules',
  initialize
};
```

As long as you follow this approach, Mirage should respect your custom inflector rules.

With the above rule,

```Js
this.store.findAll('advice');
```

would now result in a `GET` request to `/api/advice`, and

```js
// mirage/config.js
this.resource('advice');
```

would respond correctly to that request, as well as correctly handle all other operations to the `Advice` resource.
