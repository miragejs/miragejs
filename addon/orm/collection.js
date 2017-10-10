import assert from '../assert';
import _invokeMap from 'lodash/invokeMap';

/**
  Collections represent arrays of models. They are returned by a hasMany association, or by one of the ModelClass query methods:

  ```js
  let posts = user.blogPosts;
  let posts = schema.blogPosts.all();
  let posts = schema.blogPosts.find([1, 2, 4]);
  let posts = schema.blogPosts.where({ published: true });
  ```

  @class Collection
  @constructor
  @public
*/
export default class Collection {
  constructor(modelName, models = []) {
    assert(
      modelName && typeof modelName === 'string',
      'You must pass a `modelName` into a Collection'
    );

    this.modelName = modelName;
    this.models = models;
  }

  /**
    The dasherized model name of models in this collection.

    ```
    let posts = author.blogPosts.all();

    posts.modelName; // "blog-post"
    ```
    @property modelName
    @public
  */
  // get modelName() {
  //   return this.modelName;
  // }

  /**
    The underlying plain JavaScript array of models in this Collection. Often
    used in assertions during testing.

    ```js
    let newPost = user.posts.models[0].title;

    assert.equal(newPost, "My first post");
    ```

    @property models
    @public
  */
  // get models() {
  //   return this.models;
  // }

  /**
     The number of models in the collection.

     ```js
     user.posts.length; // 2
     ```

     @property length
     @type Number
     @public
   */
  get length() {
    return this.models.length;
  }

  /**
     Updates each model in the collection, and immediately persists all changes to the db.

     ```js
     let posts = author.blogPosts.all();

     posts.update('published', true); // the db was updated for all posts
     ```

     @method update
     @param key
     @param val
     @return this
     @public
   */
  update(...args) {
    _invokeMap(this.models, 'update', ...args);

    return this;
  }

  /**
     Destroys the db record for all models in the collection.

     ```js
     let posts = author.blogPosts.all();

     posts.destroy(); // all posts removed from db
     ```

     @method destroy
     @return this
     @public
   */
  destroy() {
    _invokeMap(this.models, 'destroy');

    return this;
  }

  /**
     Saves all models in the collection.

     ```js
     let posts = author.blogPosts.all();

     posts.models[0].published = true;

     posts.save(); // all posts saved to db
     ```

     @method save
     @return this
     @public
   */
  save() {
    _invokeMap(this.models, 'save');

    return this;
  }

  /**
     Reloads each model in the collection.

     @method reload
     @return this
     @public
   */
  reload() {
    _invokeMap(this.models, 'reload');

    return this;
  }

  /**
     Adds a model to this collection.

     ```js
     user.posts.add(newPost);
     ```

     @method add
     @param model
     @return this
     @public
   */
  add(model) {
    this.models.push(model);

    return this;
  }

  /**
     Removes a model to this collection

     @method remove
     @return this
     @public
   */
  remove(model) {
    let [ match ] = this.models.filter(m => m.toString() === model.toString());
    if (match) {
      let i = this.models.indexOf(match);
      this.models.splice(i, 1);
    }

    return this;
  }

  /**
     Checks if the collection includes the model

     @method includes
     @return boolean
     @public
   */
  includes(model) {
    return this.models.filter(m => m.toString() === model.toString()).length > 0;
  }

  /**
     @method filter
     @param f
     @return {Collection}
     @public
   */
  filter(f) {
    let filteredModels = this.models.filter(f);

    return new Collection(this.modelName, filteredModels);
  }

  /**
     Returns a new Collection with its models sorted according to the provided [compare function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Parameters).

     ```js
     let posts = author.blogPosts.all();

     let postsByTitleAsc = posts.sort((a, b) => {
       return b.title < a.title;
     });
     ```

     @method sort
     @param f
     @return {Collection}
     @public
   */
  sort(f) {
    let sortedModels = this.models.concat().sort(f);

    return new Collection(this.modelName, sortedModels);
  }

  /**
     @method slice
     @param {Integer} begin
     @param {Integer} end
     @return {Collection}
     @public
   */
  slice(...args) {
    let slicedModels = this.models.slice(...args);

    return new Collection(this.modelName, slicedModels);
  }

  /**
     @method mergeCollection
     @param collection
     @return this
     @public
   */
  mergeCollection(collection) {
    this.models = this.models.concat(collection.models);

    return this;
  }

  /**
     Simple string representation of the collection and id.

     @method toString
     @return {String}
     @public
   */
  toString() {
    return `collection:${this.modelName}(${this.models.map((m) => m.id).join(',')})`;
  }
}
