# Serializers are ready for testing

permalink: /blog/2015/10/19/serializers-ready/

Yesterday I merged in the [JSON:API Serializer](https://github.com/samselikoff/ember-cli-mirage/commit/9927a7f7a2232ddf8df15e01991e538eefadee9c), which is the last piece of planned work I have for the serializer layer. That means it's ready to test! I'm sure there's plenty I haven't thought of yet, but I think it's time to get some people kicking the tires.

For the brave, I'll be writing documentation this week about how to take advantage of the ORM and Serializer layer in your route handlers. Migration will be at your own pace: you should be able to switch over, keep old custom route handlers that access the db directly, and switch them over one at a time to use the new <code>schema</code> object - the ORM. Using a schema in your route handler lets you respond with a model or collection, which is the basis for your serializers knowing how to transform your response into an appropriately-formatted JSON payload.

The docs should be landing soon. But, the code is already in master (since the entire ORM is opt-in) - so, for the *truly* brave, you can try this out right now, by doing something like the following:

1. Upgrade to master ("samselikoff/ember-cli-mirage" in your package.json)
2. Define your models. For each model create a file under `mirage/models` that looks like the following:

    ```js
    // mirage/models/post.js
    import { Model } from 'ember-cli-mirage';

    export default Model;
    ```

    Use the singular version of your model for the filename.

3. Define your serializer. There are two named serializers, JSON:API and ActiveModelSerializer. You can customize these as well the basic Serializer that's also included.

    ```js
    // mirage/serializers/application.js
    import Serializer from 'ember-cli-mirage/serializers/json-api-serializer';

    export default Serializer;
    ```

4. Once you do the above, Mirage will now be using an ORM. This means your custom route handlers will no longer have the signature

    ```js
    function(db, request)
    ```

    but rather

    ```js
    function(schema, request)
    ```

    where <code>schema</code> is the ORM object. Fortunately, the <code>db</code> is available at <code>schema.db</code>. This means you can give your old route handlers access to the <code>db</code> by doing the following refactoring:

    ```diff
    - this.get('/some/path', function(db, request), {
    + this.get('/some/path', function({db}, request), {
       // your custom route handler
    });
    ```

    Not bad, thanks to the magic of ES6 object destructuring!

    Additionally, the ORM standardizes the formatting of database attributes and collections. Previously, for example, the name of the database collection was based on the filename of your fixture or factory - so, you could have a collection called <code>db.blog_posts</code>. With the ORM, everything is camel-cased (we are writing JS, after all). So, this may necessitate some refactoring of your custom route handler code.

Adding relationship support looks like this:

```js
// mirage/models/author.js
import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  posts: hasMany()
});

// mirage/models/post.js
import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  author: belongsTo()
});

// mirage/serializers/author.js
import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  relationships: ['posts']
});
```

and now, the GET shorthands to <code>/authors</code> should return included posts!

---

That's just a taste of what's to come! I want to reiterate this is very new and I basically don't suggest using it. But, if you're feeling adventurous, dive in! I would love to hear any feedback. If you do try it out, hit me up on Slack if you have questions.
