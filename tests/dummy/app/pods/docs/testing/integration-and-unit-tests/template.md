# Integration and unit tests

While Mirage was originally designed for acceptance testing, it also works great when writing integration and unit tests.

Let's say you have a data-fetching component, and you want to write a [rendering test](https://guides.emberjs.com/release/testing/#toc_rendering-tests) to verify its behavior.

You can import and use the `setupMirage` function directly in your rendering test, and use Mirage just like you would in an acceptance test.

```js
import { module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | FindRecord', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it can fetch records', async function(assert) {
    this.server.create('movie', { title: 'Interstellar' });

    await render(hbs`
      <FindRecord @modelName='movie' @id='1' as |model|>
        <h1>{{model.title}}</h1>
      </FindRecord>
    `);

    assert.equal(this.element.textContent, 'Interstellar');
  });
});
```

If you want to define some new logic for your Mirage route handlers instead of using the global ones defined in your `mirage/config.js` file, you can use `this.server` to setup new routes.


```js
import { module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | FindRecord', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders an error state', async function(assert) {
    this.server.get(
      '/movies/:id',
      () => ({ errors: [ 'Something went wrong' ]}),
      500
    );

    await render(hbs`
      <FindRecord @modelName='movie' @id='1' as |loading error model|>
        {{#if error}}
          <h1>Whoops!</h1>
        {{/if}}
      </FindRecord>
    `);

    assert.equal(this.element.textContent, 'Whoops!');
  });
});
```

## Creating Ember Data models on the client with Mirage

Something that can be a bit confusing is when you need to write a test against Ember Data models, and you reach for Mirage to help you create some.

For example, let's say we were writing a rendering test to verify the behavior of our `<ArticleForm>` component:

```js
module('Integration | Component | ArticleForm', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it can edit an article', async function(assert) {
    // get the article

    await render(hbs`
      <ArticleForm @article={{article}}>
    `);

    await fillIn('input', 'New title');
    await click('.save');

    // assert the model was saved
  });
});
```

How might we test this?

It might be tempting to use Mirage's `server.create`, since you probably already have factories defined:

```js
module('Integration | Component | ArticleForm', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it can edit an article', async function(assert) {
    // 🔴 Don't do this
    let article = this.server.create('article', {
      title: 'Old title'
    });
    this.set('article', article);

    await render(hbs`
      <ArticleForm @article={{article}}>
    `);

    await fillIn('input', 'New title');
    await click('.save');

    // assert the model was saved
  });
});
```

But you shouldn't do this.

Even though Mirage pulls its initial schema from your Ember Data models, Mirage models don't actually know anything about your Ember app.

Mirage models exist solely in your "backend", and are only useful in helping you create your mock server definition.

The only way data gets from Mirage to your Ember app is via an HTTP request – which is also true for your production server.

So, in the same way that you wouldn't create a model in your server-side framework and pass it directly into an Ember component, you should also not pass a Mirage model directly into an Ember component.

```js
// 🔴 Don't do this
// `article` is a Mirage model. It should never be consumed directly by Ember code.
let article = this.server.create('article');
this.set('article', article);

await render(hbs`
  <ArticleForm @article={{article}}>
`);
```

So, how might we get an article materialized into Ember Data's store so we can test this component, while still leveraging our Mirage factory definitions?

Right now, there is no first-class API for this, but one is in the works. In the meantime, there are two common ways to accomplish this.

### Using findRecord and findAll

The first approach is to lookup Ember Data's store, and use it to find the record (just like your Ember application's routes do):

```js
import { module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, fillIn } from '@ember/test-helpers';

module('Integration | Component | ArticleForm', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it can edit an article', async function(assert) {
    // ✅ Option 1: Use the store to find the record
    let serverArticle = this.server.create('article', {
      title: 'Old title'
    });
    let store = this.owner.lookup('service:store');
    let article = await store.findRecord('article', serverArticle.id);
    this.set('article', article);

    await render(hbs`
      <ArticleForm @article={{article}}>
    `);

    await fillIn('input', 'New title');
    await click('.save');

    // assert the model was saved
  });
});
```

### Writing a helper to push Mirage's database

The second approach is to make a helper that serializers Mirage's database into JSON and pushes that JSON into your Ember Data store.

The actual logic might depend on the configuration of your Mirage server, but if you're following all of Mirage's conventions it should look roughly like this:

```js
// your-app/tests/helpers/push-mirage-into-store.js
import { getContext } from '@ember/test-helpers';
import { run } from '@ember/runloop';

export default function() {
  let context = getContext();
  let store = context.owner.lookup('service:store');

  Object.keys(context.server.schema)
    .filter(key => context.server.schema[key].all !== undefined) // Get the resources
    .forEach(resource => {
      let models = context.server.schema[resource].all();
      let modelName = models.modelName;
      let serializer = context.server.serializerOrRegistry.serializerFor(modelName);

      let originalAlwaysIncludeLinkageData = serializer.alwaysIncludeLinkageData;
      serializer.alwaysIncludeLinkageData = true;

      let json = serializer.serialize(models);

      serializer.alwaysIncludeLinkageData = originalAlwaysIncludeLinkageData;

      run(() => {
        store.pushPayload(json);
      });
    });
}
```

Now in your test, call your helper to seed Ember Data's store, and then use `peekRecord` to materialize and work with Ember Data records:

```js
import { module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, fillIn } from '@ember/test-helpers';
import pushMirageIntoStore from 'YOUR-APP/tests/helpers/push-mirage-into-store';

module('Integration | Component | ArticleForm', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it can edit an article', async function(assert) {
    // ✅ Option 2: Use the store to find the record
    let serverArticle = this.server.create('article', {
      title: 'Old title'
    });
    pushMirageIntoStore();
    let store = this.owner.lookup('service:store');
    let article = store.peekRecord('article', serverArticle.id);
    this.set('article', article);

    await render(hbs`
      <ArticleForm @article={{article}}>
    `);

    await fillIn('input', 'New title');
    await click('.save');

    // assert the model was saved
  });
});
```

Something like `pushMirageIntoStore` will probably make its way into Mirage at some point.

---

Now that you've seen how to use `setupMirage` outside of an acceptance test, you can use it in any kind of test where it makes sense to run your Mirage server!

Next, we discuss some ways you can go about asserting against your Mirage mock server.
