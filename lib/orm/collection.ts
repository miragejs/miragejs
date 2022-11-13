import invokeMap from "lodash.invokemap";
import assert from "../assert";

/** Represents the type of an instantiated Mirage model.  */
export type ModelInstance<Data extends {} = {}> = Data & {
    id?: string;
    attrs: Data;
    modelName: string;

    /** Persists any updates on this model back to the Mirage database. */
    save(): void;

    /** Updates and immediately persists a single or multiple attr(s) on this model. */
    update<K extends keyof Data>(key: K, value: Data[K]): void;
    update(changes: Partial<Data>): void;

    /** Removes this model from the Mirage database. */
    destroy(): void;

    /** Reloads this model's data from the Mirage database. */
    reload(): void;

    toString(): string;
};

/**
  Collections represent arrays of models. They are returned by a hasMany association, or by one of the ModelClass query methods:

  ```js
  let posts = user.blogPosts;
  let posts = schema.blogPosts.all();
  let posts = schema.blogPosts.find([1, 2, 4]);
  let posts = schema.blogPosts.where({ published: true });
  ```

  Note that there is also a `PolymorphicCollection` class that is identical to `Collection`, except it can contain a heterogeneous array of models. Thus, it has no `modelName` property. This lets serializers and other parts of the system interact with it differently.

  @class Collection
  @constructor
  @public
*/

type Element<T> = T extends ModelInstance<infer ElementType> ? ElementType : never;

export default class Collection<T extends ModelInstance<ElementType>, ElementType extends {} = Element<T>> extends Array<T> {
    modelName: string;

    public constructor(modelName?: string | number, items?: T[]) {
        assert(
            modelName !== undefined,
            "You must pass a `modelName` into a Collection"
        );
        if (typeof modelName === 'string') {
            super(...(items ?? []));
            this.modelName = modelName;
        } else {
            super(modelName!);
            this.modelName = '';
        }
    }

    public get models(): T[] {
        return this.map(item => item);
    }

    public set models(models: T[]) {
        this.length = 0;
        models.forEach((item) => this.push(item));
    }

    /**
        Adds a model to this collection.

        ```js
        posts.length; // 1

        posts.add(newPost);

        posts.length; // 2
        ```

        @method add
        @param {Model} model
        @return this
        @public
    */
    public add(model: T): Collection<T, ElementType> {
        this.push(model);
        return this;
    }

    /**
        Destroys the db record for all models in the collection.

        ```js
        let posts = user.blogPosts;

        posts.destroy(); // all posts removed from db
        ```

        @method destroy
        @return this
        @public
    */
    public destroy(): Collection<T, ElementType> {
        this.forEach((item) => item.destroy());
        return this;
    }

    /**
        Returns a new Collection with its models filtered according to the provided [callback function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

        ```js
        let publishedPosts = user.posts.filter(post => post.isPublished);
        ```
        @method filter
        @param {Function} f
        @return {Collection}
        @public
    */
    public filter(f: (value: T, index: number, models: T[]) => unknown): Collection<T, ElementType> {
        const filteredModels: T[] = [];
        this.forEach((item, index, array) => {
            if (f(item, index, array)) {
                filteredModels.push(item);
            }
        });

        return new Collection(this.modelName, filteredModels);
    }

    public concat(...items: ConcatArray<T>[]): Collection<T, ElementType> {
        const concatenated: T[] = [];
        this.forEach((item) => {
            concatenated.push(item);
        });
        items.forEach(array => {
            for (let i = 0; i < array.length; i++) {
                concatenated.push(array[i]);
            }
        })
        return new Collection(this.modelName, concatenated);
    }

    /**
        Checks if the Collection includes the given model.

        ```js
        posts.includes(newPost);
        ```

        Works by checking if the given model name and id exists in the Collection,
        making it a bit more flexible than strict object equality.

        ```js
        let post = server.create('post');
        let programming = server.create('tag', { text: 'Programming' });

        visit(`/posts/${post.id}`);
        click('.tag-selector');
        click('.tag:contains(Programming)');

        post.reload();
        assert.ok(post.tags.includes(programming));
        ```

        @method includes
        @return {Boolean}
        @public
    */
    public includes(model: ElementType): boolean {
        return this.some((m) => m.toString() === model.toString());
    }

    /**
        Modifies the Collection by merging the models from another collection.

        ```js
        user.posts.mergeCollection(newPosts);
        user.posts.save();
        ```

        @method mergeCollection
        @param {Collection} collection
        @return this
        @public
    */
    public mergeCollection(collection: Collection<T, ElementType>): Collection<T, ElementType> {
        collection.forEach((item) => this.push(item));
        return this;
    }

    /**
        Reloads each model in the collection.

        ```js
        let posts = author.blogPosts;

        // ...

        posts.reload(); // reloads data for each post from the db
        ```

        @method reload
        @return this
        @public
    */
    public reload(): Collection<T, ElementType> {
        this.forEach((item) => item.reload());
        return this;
    }

    /**
        Removes a model from this collection.

        ```js
        posts.length; // 5

        let firstPost = posts.models[0];
        posts.remove(firstPost);
        posts.save();

        posts.length; // 4
        ```

        @method remove
        @param {Model} model
        @return this
        @public
    */
    public remove(model: ElementType): Collection<T, ElementType> {
        let match = this.find((m) => m.toString() === model.toString());
        if (match) {
            let i = this.indexOf(match);
            this.splice(i, 1);
        }

        return this;
    }

    /**
        Returns a new Collection with a subset of its models selected from `begin` to `end`.

        ```js
        let firstThreePosts = user.posts.slice(0, 3);
        ```

        @method slice
        @param {Integer} begin
        @param {Integer} end
        @return {Collection}
        @public
    */
    public slice(begin: number, end: number): Collection<T, ElementType> {
        return new Collection(this.modelName, super.slice(begin, end));
    }

    /**
         Updates each model in the collection, and immediately persists all changes to the db.

        ```js
        let posts = user.blogPosts;

        posts.update('published', true); // the db was updated for all posts
        ```

        @method update
        @param key
        @param val
        @return this
    */
    public update<K extends keyof ElementType>(key: K & string, val: T[K]): Collection<T, ElementType> {
        this.forEach(item => item.update(key, val));
        return this;
    }

    public save(): Collection<T, ElementType> {
        this.forEach((item) => item.save());
        return this;
    }

    public map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
        const result: U[] = [];
        this.forEach((item, index, array) => {
            result.push(callbackfn(item, index, array));
        });
        return result;
    }

    /**
         Simple string representation of the collection and id.

        ```js
        user.posts.toString(); // collection:post(post:1,post:4)
        ```

        @method toString
        @return {String}
        @public
    */
    toString() {
        return `collection:${this.modelName}(${this
        .map((m) => m.id)
        .join(",")})`;
    }
}
