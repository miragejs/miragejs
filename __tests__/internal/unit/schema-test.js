import {
  Factory,
  Model,
  Schema,
  association,
  belongsTo,
  hasMany,
  trait,
} from "@lib";

describe("Unit | Schema", function () {
  let schema = null;

  beforeEach(function () {
    schema = new Schema();
  });

  test("it can be instantiated without a db", () => {
    expect(schema).toBeTruthy();
    expect(schema.db).toBeTruthy();
  });

  test("modelFor returns model for given type if registered", () => {
    expect(schema.modelFor("article")).toBeUndefined();

    let authorModel = Model.extend({});
    let articleModel = Model.extend({
      author: belongsTo(),
    });
    schema.registerModel("article", articleModel);
    schema.registerModel("author", authorModel);

    expect(schema.modelFor("article").foreignKeys).toEqual(["authorId"]);
    expect(schema.modelFor("author").foreignKeys).toEqual([]);
  });

  test("`first()` returns null when nothing is found", () => {
    expect.assertions(2);

    let authorModel = Model.extend({});
    schema.registerModel("author", authorModel);

    expect(schema.first("author")).toBeNull();

    let record = schema.create("author", { id: 1, name: "Mary Roach" });

    expect(schema.first("author")).toEqual(record);
  });

  test("`findBy()` returns null when nothing is found", () => {
    expect.assertions(3);

    let authorModel = Model.extend({});
    schema.registerModel("author", authorModel);

    expect(schema.findBy("author", { name: "Mary Roach" })).toBeNull();

    let record = schema.create("author", { id: 1, name: "Mary Roach" });

    expect(schema.findBy("author", { name: "Mary Roach" })).toEqual(record);
    expect(schema.findBy("author", { name: "Charles Dickens" })).toBeNull();
  });

  test("`findBy()` accepts a predicate function to find the desired instance", () => {
    const movieModel = Model.extend({});
    schema.registerModel("movie", movieModel);

    schema.create("movie", { id: 1, title: "Up" });
    const movie = schema.create("movie", { id: 2, title: "Some title" });
    schema.create("movie", { id: 3, title: "Some other title" });
    const found = schema.findBy("movie", (movie) => movie.title.length > 4);

    // Finds the first match
    expect(found).toEqual(movie);
  });
});

describe("Unit | Schema #build", function () {
  let schema = null;

  beforeEach(function () {
    schema = new Schema();
  });

  test("does not add element to the db", () => {
    schema.registerFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    schema.build("contact");
    let contactsInDb = schema.db.contacts;

    expect(contactsInDb).toHaveLength(0);
  });

  test("returns the new attrs with no id", () => {
    schema.registerFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    let contact = schema.build("contact");

    expect(contact).toEqual({ name: "Sam" });
  });

  test("allows for attr overrides", () => {
    schema.registerFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    let sam = schema.build("contact");
    let link = schema.build("contact", { name: "Link" });

    expect(sam).toEqual({ name: "Sam" });
    expect(link).toEqual({ name: "Link" });
  });

  test("allows for attr overrides with extended factories", () => {
    let ContactFactory = Factory.extend({
      name: "Link",
      age: 500,
    });
    let FriendFactory = ContactFactory.extend({
      is_young() {
        return this.age < 18;
      },
    });
    schema.registerFactories({
      contact: ContactFactory,
      friend: FriendFactory,
    });

    let link = schema.build("friend");
    let youngLink = schema.build("friend", { age: 10 });

    expect(link).toEqual({ name: "Link", age: 500, is_young: false });
    expect(youngLink).toEqual({ name: "Link", age: 10, is_young: true });
  });

  test("allows for attr overrides with arrays", () => {
    schema.registerFactories({
      contact: Factory.extend({ name: ["Sam", "Carl"] }),
    });

    let sam = schema.build("contact");
    let link = schema.build("contact", { name: ["Link"] });
    let noname = schema.build("contact", { name: [] });

    expect(sam).toEqual({ name: ["Sam", "Carl"] });
    expect(link).toEqual({ name: ["Link"] });
    expect(noname).toEqual({ name: [] });
  });

  test("allows for nested attr overrides", () => {
    schema.registerFactories({
      contact: Factory.extend({
        address: {
          streetName: "Main",
          streetAddress(i) {
            return 1000 + i;
          },
        },
      }),
    });

    let contact1 = schema.build("contact");
    let contact2 = schema.build("contact");

    expect(contact1).toEqual({
      address: { streetName: "Main", streetAddress: 1000 },
    });
    expect(contact2).toEqual({
      address: { streetName: "Main", streetAddress: 1001 },
    });
  });

  test("allows for arrays of attr overrides", () => {
    schema.registerFactories({
      contact: Factory.extend({
        websites: [
          "http://example.com",
          function (i) {
            return `http://placekitten.com/${320 + i}/${240 + i}`;
          },
        ],
      }),
    });

    let contact1 = schema.build("contact");
    let contact2 = schema.build("contact");

    expect(contact1).toEqual({
      websites: ["http://example.com", "http://placekitten.com/320/240"],
    });
    expect(contact2).toEqual({
      websites: ["http://example.com", "http://placekitten.com/321/241"],
    });
  });

  test("allows to extend factory with trait", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    let article = schema.build("article");
    let publishedArticle = schema.build("article", "published");

    expect(article).toEqual({ title: "Lorem ipsum" });
    expect(publishedArticle).toEqual({
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
    });
  });

  test("allows to extend factory with multiple traits", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),

      withContent: trait({
        content: "content",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    let article = schema.build("article");
    let publishedArticle = schema.build("article", "published");
    let publishedArticleWithContent = schema.build(
      "article",
      "published",
      "withContent"
    );

    expect(article).toEqual({ title: "Lorem ipsum" });
    expect(publishedArticle).toEqual({
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
    });
    expect(publishedArticleWithContent).toEqual({
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
      content: "content",
    });
  });

  test("allows to extend with multiple traits and to apply attr overrides", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),

      withContent: trait({
        content: "content",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    let overrides = {
      publishedAt: "2012-01-01 10:00:00",
    };
    let publishedArticleWithContent = schema.build(
      "article",
      "published",
      "withContent",
      overrides
    );

    expect(publishedArticleWithContent).toEqual({
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2012-01-01 10:00:00",
      content: "content",
    });
  });

  test("allows to build objects with associations", () => {
    let AuthorFactory = Factory.extend({
      name: "Yehuda",
    });
    let CategoryFactory = Factory.extend({
      name: "splendid software",
    });
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      withCategory: trait({
        awesomeCategory: association(),
      }),

      someOtherTrait: trait({
        user: association(),
      }),

      author: association(),
    });

    schema.registerFactories({
      article: ArticleFactory,
      author: AuthorFactory,
      category: CategoryFactory,
    });
    schema.registerModels({
      author: Model.extend({
        articles: hasMany(),
      }),
      category: Model.extend({}),
      article: Model.extend({
        author: belongsTo(),
        awesomeCategory: belongsTo("category"),
      }),
    });

    let article = schema.build("article", "withCategory");

    expect(article).toEqual({
      title: "Lorem ipsum",
      authorId: "1",
      awesomeCategoryId: "1",
    });
    expect(schema.db.authors).toHaveLength(1);
    expect(schema.db.categories).toHaveLength(1);
  });

  test("allows to build objects with associations with traits and overrides for associations", () => {
    let CategoryFactory = Factory.extend({
      name: "splendid software",

      published: trait({
        isPublished: true,
        publishedAt: "2014-01-01 10:00:00",
      }),
    });
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      withCategory: trait({
        category: association("published", {
          publishedAt: "2016-01-01 12:00:00",
        }),
      }),
    });

    schema.registerModels({
      category: Model.extend({}),
      article: Model.extend({
        category: belongsTo(),
      }),
    });
    schema.registerFactories({
      article: ArticleFactory,
      category: CategoryFactory,
    });

    let article = schema.build("article", "withCategory");

    expect(article).toEqual({ title: "Lorem ipsum", categoryId: "1" });
    expect(schema.db.categories).toHaveLength(1);
    expect(schema.db.categories[0]).toEqual({
      name: "splendid software",
      id: "1",
      isPublished: true,
      publishedAt: "2016-01-01 12:00:00",
    });
  });

  test("throws errors when using trait that is not defined and distinquishes between traits and non-traits", () => {
    schema.registerFactories({
      article: Factory.extend({
        title: "Lorem ipsum",

        published: trait({
          isPublished: true,
          publishedAt: "2010-01-01 10:00:00",
        }),

        private: {
          someAttr: "value",
        },
      }),
    });

    expect(() => {
      schema.build("article", "private");
    }).toThrow("'private' trait is not registered in 'article' factory");
  });

  test("does not build objects and throws error if model is not registered and association helper is used", () => {
    schema.registerFactories({
      article: Factory.extend({
        title: "Lorem ipsum",

        withCategory: trait({
          category: association("published", {
            publishedAt: "2016-01-01 12:00:00",
          }),
        }),
      }),
      category: Factory.extend({
        name: "splendid software",

        published: trait({
          isPublished: true,
          publishedAt: "2014-01-01 10:00:00",
        }),
      }),
    });
    schema.registerModels({
      category: Model.extend(),
    });

    expect(() => {
      schema.build("article", "withCategory");
    }).toThrow("Mirage: Model not registered: article");
  });

  test("does not build objects and throws error if model for given association is not registered", () => {
    schema.registerFactories({
      article: Factory.extend({
        title: "Lorem ipsum",

        withCategory: trait({
          category: association("published", {
            publishedAt: "2016-01-01 12:00:00",
          }),
        }),
      }),
      category: Factory.extend({
        name: "splendid software",

        published: trait({
          isPublished: true,
          publishedAt: "2014-01-01 10:00:00",
        }),
      }),
    });
    schema.registerModels({
      article: Model.extend(),
    });

    expect(() => {
      schema.build("article", "withCategory");
    }).toThrow(
      "Mirage: You're using the `association` factory helper on the 'category' attribute of your article factory, but that attribute is not a `belongsTo` association."
    );
  });
});

describe("Unit | Schema #buildList", function () {
  let schema = null;

  beforeEach(function () {
    schema = new Schema();
  });

  test("does not add elements to the db", () => {
    schema.registerFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    schema.buildList("contact", 3);
    let contactsInDb = schema.db.contacts;

    expect(contactsInDb).toHaveLength(0);
  });

  test("returns the built elements without ids", () => {
    schema.registerFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    let contacts = schema.buildList("contact", 3);

    expect(contacts).toHaveLength(3);
    expect(contacts[0]).toEqual({ name: "Sam" });
    expect(contacts[1]).toEqual({ name: "Sam" });
    expect(contacts[2]).toEqual({ name: "Sam" });
  });

  test("respects sequences", () => {
    schema.registerFactories({
      contact: Factory.extend({
        name(i) {
          return `name${i}`;
        },
      }),
    });

    let contacts = schema.buildList("contact", 3);

    expect(contacts[0]).toEqual({ name: "name0" });
    expect(contacts[1]).toEqual({ name: "name1" });
    expect(contacts[2]).toEqual({ name: "name2" });
  });

  test("respects attr overrides", () => {
    schema.registerFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    let sams = schema.buildList("contact", 2);
    let links = schema.buildList("contact", 2, { name: "Link" });

    expect(sams[0]).toEqual({ name: "Sam" });
    expect(sams[1]).toEqual({ name: "Sam" });
    expect(links[0]).toEqual({ name: "Link" });
    expect(links[1]).toEqual({ name: "Link" });
  });

  test("respects traits", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),

      withContent: trait({
        content: "content",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    let articles = schema.buildList("article", 2, "published", "withContent");

    expect(articles[0]).toEqual({
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
      content: "content",
    });
    expect(articles[1]).toEqual({
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
      content: "content",
    });
  });

  test("respects traits with attr overrides", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),

      withContent: trait({
        content: "content",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    let overrides = { publishedAt: "2012-01-01 10:00:00" };
    let articles = schema.buildList(
      "article",
      2,
      "published",
      "withContent",
      overrides
    );

    expect(articles[0]).toEqual({
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2012-01-01 10:00:00",
      content: "content",
    });
    expect(articles[1]).toEqual({
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2012-01-01 10:00:00",
      content: "content",
    });
  });

  test("throws errors when using trait that is not defined and distinquishes between traits and non-traits", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),

      private: {
        someAttr: "value",
      },
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    expect(() => {
      schema.buildList("article", 2, "private");
    }).toThrow("'private' trait is not registered in 'article' factory");
  });

  test("throws an error if the second argument is not an integer", function () {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    expect(() => {
      schema.buildList("article", "published");
    }).toThrow(
      "Mirage: second argument has to be an integer, you passed: string"
    );
  });
});

describe("Unit | Schema #create", function () {
  let schema = null;

  beforeEach(function () {
    schema = new Schema();
  });

  test("create fails when no factories or models are registered", () => {
    expect(function () {
      schema.create("contact");
    }).toThrow(
      "Mirage: You called create('contact') but no model or factory was found. Make sure you're passing in the singularized version of the model or factory name."
    );
  });

  test("create fails when an expected factory isn't registered", () => {
    schema.registerFactories({
      address: Factory,
    });

    expect(function () {
      schema.create("contact");
    }).toThrow(
      "Mirage: You called create('contact') but no model or factory was found. Make sure you're passing in the singularized version of the model or factory name."
    );
  });

  test("create works when models but no factories are registered", () => {
    schema.registerModels({
      contact: Model,
    });

    schema.create("contact");

    expect(schema.db.contacts).toHaveLength(1);
  });

  test("create adds the data to the db", () => {
    schema.registerFactories({
      contact: Factory.extend({
        name: "Sam",
      }),
    });

    schema.create("contact");
    let contactsInDb = schema.db.contacts;

    expect(contactsInDb).toHaveLength(1);
    expect(contactsInDb[0]).toEqual({ id: "1", name: "Sam" });
  });

  test("create returns the new data in the db", () => {
    schema.registerFactories({
      contact: Factory.extend({
        name: "Sam",
      }),
    });

    let contact = schema.create("contact");

    expect(contact).toEqual({ id: "1", name: "Sam" });
  });

  test("create allows for attr overrides", () => {
    schema.registerFactories({
      contact: Factory.extend({
        name: "Sam",
      }),
    });

    let sam = schema.create("contact");
    let link = schema.create("contact", { name: "Link" });

    expect(sam).toEqual({ id: "1", name: "Sam" });
    expect(link).toEqual({ id: "2", name: "Link" });
  });

  test("create allows for attr overrides with extended factories", () => {
    let ContactFactory = Factory.extend({
      name: "Link",
      age: 500,
    });
    let FriendFactory = ContactFactory.extend({
      is_young() {
        return this.age < 18;
      },
    });

    schema.registerFactories({
      contact: ContactFactory,
      friend: FriendFactory,
    });

    let link = schema.create("friend");
    let youngLink = schema.create("friend", { age: 10 });

    expect(link).toEqual({ id: "1", name: "Link", age: 500, is_young: false });
    expect(youngLink).toEqual({
      id: "2",
      name: "Link",
      age: 10,
      is_young: true,
    });
  });

  test("create allows for attr overrides with arrays", () => {
    schema.registerFactories({
      contact: Factory.extend({
        name: ["Sam", "Carl"],
      }),
    });

    let sam = schema.create("contact");
    let link = schema.create("contact", { name: ["Link"] });
    let noname = schema.create("contact", { name: [] });

    expect(sam).toEqual({ id: "1", name: ["Sam", "Carl"] });
    expect(link).toEqual({ id: "2", name: ["Link"] });
    expect(noname).toEqual({ id: "3", name: [] });
  });

  test("create allows for nested attr overrides", () => {
    schema.registerFactories({
      contact: Factory.extend({
        address: {
          streetName: "Main",
          streetAddress(i) {
            return 1000 + i;
          },
        },
      }),
    });

    let contact1 = schema.create("contact");
    let contact2 = schema.create("contact");

    expect(contact1).toEqual({
      id: "1",
      address: { streetName: "Main", streetAddress: 1000 },
    });
    expect(contact2).toEqual({
      id: "2",
      address: { streetName: "Main", streetAddress: 1001 },
    });
  });

  test("factories can have dynamic properties that depend on attr overrides", () => {
    schema.registerFactories({
      baz: Factory.extend({
        bar() {
          return this.name.substr(1);
        },
      }),
    });

    let baz1 = schema.create("baz", { name: "foo" });

    expect(baz1).toEqual({ id: "1", name: "foo", bar: "oo" });
  });

  test("create allows for arrays of attr overrides", () => {
    schema.registerFactories({
      contact: Factory.extend({
        websites: [
          "http://example.com",
          function (i) {
            return `http://placekitten.com/${320 + i}/${240 + i}`;
          },
        ],
      }),
    });

    let contact1 = schema.create("contact");
    let contact2 = schema.create("contact");

    expect(contact1).toEqual({
      id: "1",
      websites: ["http://example.com", "http://placekitten.com/320/240"],
    });
    expect(contact2).toEqual({
      id: "2",
      websites: ["http://example.com", "http://placekitten.com/321/241"],
    });
  });

  test("create allows to extend factory with trait", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    let article = schema.create("article");
    let publishedArticle = schema.create("article", "published");

    expect(article).toEqual({ id: "1", title: "Lorem ipsum" });
    expect(publishedArticle).toEqual({
      id: "2",
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
    });
  });

  test("create allows to extend factory with multiple traits", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),

      withContent: trait({
        content: "content",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    let article = schema.create("article");
    let publishedArticle = schema.create("article", "published");
    let publishedArticleWithContent = schema.create(
      "article",
      "published",
      "withContent"
    );

    expect(article).toEqual({ id: "1", title: "Lorem ipsum" });
    expect(publishedArticle).toEqual({
      id: "2",
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
    });
    expect(publishedArticleWithContent).toEqual({
      id: "3",
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
      content: "content",
    });
  });

  test("create allows to extend factory with traits containing afterCreate callbacks", () => {
    let CommentFactory = Factory.extend({
      content: "content",
    });
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      withComments: trait({
        afterCreate(article, server) {
          server.createList("comment", 3, { article });
        },
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
      comment: CommentFactory,
    });

    let articleWithComments = schema.create("article", "withComments");

    expect(articleWithComments).toEqual({ id: "1", title: "Lorem ipsum" });
    expect(schema.db.comments).toHaveLength(3);
  });

  test("create does not execute afterCreate callbacks from traits that are not applied", () => {
    let CommentFactory = Factory.extend({
      content: "content",
    });
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      withComments: trait({
        afterCreate(article, server) {
          server.createList("comment", 3, { article });
        },
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
      comment: CommentFactory,
    });

    let articleWithComments = schema.create("article");

    expect(articleWithComments).toEqual({ id: "1", title: "Lorem ipsum" });
    expect(schema.db.comments).toHaveLength(0);
  });

  test("create allows to extend with multiple traits and to apply attr overrides", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),

      withContent: trait({
        content: "content",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    let overrides = {
      publishedAt: "2012-01-01 10:00:00",
    };
    let publishedArticleWithContent = schema.create(
      "article",
      "published",
      "withContent",
      overrides
    );

    expect(publishedArticleWithContent).toEqual({
      id: "1",
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2012-01-01 10:00:00",
      content: "content",
    });
  });

  test("create throws errors when using trait that is not defined and distinquishes between traits and non-traits", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),

      private: {
        someAttr: "value",
      },
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    expect(() => {
      schema.create("article", "private");
    }).toThrow("'private' trait is not registered in 'article' factory");
  });

  test("create allows to create objects with associations", () => {
    let AuthorFactory = Factory.extend({
      name: "Sam",
    });
    let CategoryFactory = Factory.extend({
      name: "splendid software",
    });
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      withCategory: trait({
        awesomeCategory: association(),
      }),

      author: association(),
    });

    schema.registerModels({
      author: Model.extend({
        articles: hasMany(),
      }),
      category: Model.extend({}),
      article: Model.extend({
        author: belongsTo(),
        awesomeCategory: belongsTo("category"),
      }),
    });
    schema.registerFactories({
      author: AuthorFactory,
      category: CategoryFactory,
      article: ArticleFactory,
    });

    let article = schema.create("article", "withCategory");

    expect(article.attrs).toEqual({
      title: "Lorem ipsum",
      id: "1",
      authorId: "1",
      awesomeCategoryId: "1",
    });
    expect(schema.db.authors).toHaveLength(1);
    expect(schema.db.categories).toHaveLength(1);

    let anotherArticle = schema.create("article", "withCategory");
    expect(anotherArticle.attrs).toEqual({
      title: "Lorem ipsum",
      id: "2",
      authorId: "2",
      awesomeCategoryId: "2",
    });
    expect(schema.db.authors).toHaveLength(2);
    expect(schema.db.categories).toHaveLength(2);
  });

  test("create allows to create objects with associations with traits and overrides for associations", () => {
    let CategoryFactory = Factory.extend({
      name: "splendid software",

      published: trait({
        isPublished: true,
        publishedAt: "2014-01-01 10:00:00",
      }),
    });
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      withCategory: trait({
        category: association("published", {
          publishedAt: "2016-01-01 12:00:00",
        }),
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
      category: CategoryFactory,
    });

    schema.registerModels({
      category: Model.extend({}),
      article: Model.extend({
        category: belongsTo("category"),
      }),
    });

    let article = schema.create("article", "withCategory");

    expect(article.attrs).toEqual({
      title: "Lorem ipsum",
      id: "1",
      categoryId: "1",
    });
    expect(schema.db.categories).toHaveLength(1);
    expect(schema.db.categories[0]).toEqual({
      name: "splendid software",
      id: "1",
      isPublished: true,
      publishedAt: "2016-01-01 12:00:00",
    });
  });

  test("create does not create (extra) models on associations when they are passed in as overrides", () => {
    let MotherFactory = Factory.extend({
      name: "Should not create",
    });
    let ChildFactory = Factory.extend({
      mother: association(),
    });

    schema.registerFactories({
      mother: MotherFactory,
      child: ChildFactory,
    });

    schema.registerModels({
      mother: Model.extend({
        children: hasMany("child"),
      }),
      child: Model.extend({
        mother: belongsTo("mother"),
      }),
    });

    let mother = schema.create("mother", { name: "Lynda" });
    schema.create("child", { name: "Don", mother });
    schema.create("child", { name: "Dan", mother });

    expect(schema.db.mothers).toHaveLength(1);
  });
});

describe("Unit | Schema #createList", function () {
  let schema = null;

  beforeEach(function () {
    schema = new Schema();
  });

  test("createList adds the given number of elements to the db", () => {
    schema.registerFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    schema.createList("contact", 3);
    let contactsInDb = schema.db.contacts;

    expect(contactsInDb).toHaveLength(3);
    expect(contactsInDb[0]).toEqual({ id: "1", name: "Sam" });
    expect(contactsInDb[1]).toEqual({ id: "2", name: "Sam" });
    expect(contactsInDb[2]).toEqual({ id: "3", name: "Sam" });
  });

  test("createList returns the created elements", () => {
    schema.registerFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    let contacts = schema.createList("contact", 3);

    expect(contacts).toHaveLength(3);
    expect(contacts[0]).toEqual({ id: "1", name: "Sam" });
    expect(contacts[1]).toEqual({ id: "2", name: "Sam" });
    expect(contacts[2]).toEqual({ id: "3", name: "Sam" });
  });

  test("createList respects sequences", () => {
    schema.registerFactories({
      contact: Factory.extend({
        name(i) {
          return `name${i}`;
        },
      }),
    });

    let contacts = schema.createList("contact", 3);

    expect(contacts[0]).toEqual({ id: "1", name: "name0" });
    expect(contacts[1]).toEqual({ id: "2", name: "name1" });
    expect(contacts[2]).toEqual({ id: "3", name: "name2" });
  });

  test("createList respects attr overrides", () => {
    schema.registerFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    let sams = schema.createList("contact", 2);
    let links = schema.createList("contact", 2, { name: "Link" });

    expect(sams[0]).toEqual({ id: "1", name: "Sam" });
    expect(sams[1]).toEqual({ id: "2", name: "Sam" });
    expect(links[0]).toEqual({ id: "3", name: "Link" });
    expect(links[1]).toEqual({ id: "4", name: "Link" });
  });

  test("createList respects traits", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),

      withContent: trait({
        content: "content",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    let articles = schema.createList("article", 2, "published", "withContent");

    expect(articles[0]).toEqual({
      id: "1",
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
      content: "content",
    });
    expect(articles[1]).toEqual({
      id: "2",
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
      content: "content",
    });
  });

  test("createList respects traits with attr overrides", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),

      withContent: trait({
        content: "content",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    let overrides = { publishedAt: "2012-01-01 10:00:00" };
    let articles = schema.createList(
      "article",
      2,
      "published",
      "withContent",
      overrides
    );

    expect(articles[0]).toEqual({
      id: "1",
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2012-01-01 10:00:00",
      content: "content",
    });
    expect(articles[1]).toEqual({
      id: "2",
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2012-01-01 10:00:00",
      content: "content",
    });
  });

  test("createList throws errors when using trait that is not defined and distinquishes between traits and non-traits", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),

      private: {
        someAttr: "value",
      },
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    expect(() => {
      schema.createList("article", 2, "private");
    }).toThrow("'private' trait is not registered in 'article' factory");
  });

  test("createList throws an error if the second argument is not an integer", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),
    });

    schema.registerFactories({
      article: ArticleFactory,
    });

    expect(() => {
      schema.createList("article", "published");
    }).toThrow(
      "Mirage: second argument has to be an integer, you passed: string"
    );
  });
});
