import {
  createServer,
  Server,
  Model,
  Factory,
  belongsTo,
  hasMany,
  trait,
  association,
} from "@lib";

describe("Unit | Server", function () {
  test("it can be instantiated", () => {
    let server = new Server({ environment: "test" });

    expect(server).toBeTruthy();

    server.shutdown();
  });

  test("routes return pretender handler", () => {
    let server = new Server({ environment: "test" });

    let handler = server.post("foo");

    expect(handler.numberOfCalls).toBe(0);

    server.shutdown();
  });

  test("it runs the default scenario in non-test environments", () => {
    expect.assertions(1);

    let server = new Server({
      environment: "development",
      seeds() {
        expect(true).toBeTruthy();
      },
    });

    server.shutdown();
  });
});

describe("Unit | createServer", function () {
  test("it returns a server instance", () => {
    let server = createServer();

    expect(server).toBeTruthy();

    server.shutdown();
  });

  test("routes return pretender handler", () => {
    let server = createServer({ environment: "test" });

    let handler = server.post("foo");

    expect(handler.numberOfCalls).toBe(0);

    server.shutdown();
  });

  test("it runs the default scenario in non-test environments", () => {
    expect.assertions(1);

    let server = createServer({
      environment: "development",
      seeds() {
        expect(true).toBeTruthy();
      },
    });

    server.shutdown();
  });
});

describe("Unit | Server #loadConfig", function () {
  test("forces timing to 0 in test environment", () => {
    let server = new Server({ environment: "test" });

    server.loadConfig(function () {
      this.timing = 50;
    });

    expect(server.timing).toEqual(0);

    server.shutdown();
  });

  test("doesn't modify user's timing config in other environments", () => {
    let server = new Server({ environment: "blah" });

    server.loadConfig(function () {
      this.timing = 50;
    });

    expect(server.timing).toEqual(50);

    server.shutdown();
  });
});

describe("Unit | Server #db", function () {
  test("its db is isolated across instances", () => {
    let server1 = new Server({ environment: "test" });

    server1.db.createCollection("contacts");
    server1.db.contacts.insert({ name: "Sam" });

    server1.shutdown();

    let server2 = new Server({ environment: "test" });

    expect(server2.contacts).toBeUndefined();

    server2.shutdown();
  });
});

describe("Unit | Server #create", function () {
  test("create fails when no factories or models are registered", () => {
    let server = new Server({ environment: "test" });

    expect(function () {
      server.create("contact");
    }).toThrow(
      "Mirage: You called server.create('contact') but no model or factory was found. Make sure you're passing in the singularized version of the model or factory name."
    );

    server.shutdown();
  });

  test("create fails when an expected factory isn't registered", () => {
    let server = new Server({
      environment: "test",
      factories: {
        address: Factory,
      },
    });

    expect(function () {
      server.create("contact");
    }).toThrow(
      "Mirage: You called server.create('contact') but no model or factory was found. Make sure you're passing in the singularized version of the model or factory name."
    );

    server.shutdown();
  });

  test("create works when models but no factories are registered", () => {
    let server = new Server({
      environment: "test",
      models: {
        contact: Model,
      },
    });

    server.create("contact");

    expect(server.db.contacts).toHaveLength(1);

    server.shutdown();
  });

  test("create adds the data to the db", () => {
    let server = new Server({
      environment: "test",
      factories: {
        contact: Factory.extend({
          name: "Sam",
        }),
      },
    });

    server.create("contact");
    let contactsInDb = server.db.contacts;

    expect(contactsInDb).toHaveLength(1);
    expect(contactsInDb[0]).toEqual({ id: "1", name: "Sam" });

    server.shutdown();
  });

  test("create returns the new data in the db", () => {
    let server = new Server({
      environment: "test",
      factories: {
        contact: Factory.extend({
          name: "Sam",
        }),
      },
    });

    let contact = server.create("contact");

    expect(contact).toEqual({ id: "1", name: "Sam" });

    server.shutdown();
  });

  test("create allows for attr overrides", () => {
    let server = new Server({
      environment: "test",
      factories: {
        contact: Factory.extend({
          name: "Sam",
        }),
      },
    });

    let sam = server.create("contact");
    let link = server.create("contact", { name: "Link" });

    expect(sam).toEqual({ id: "1", name: "Sam" });
    expect(link).toEqual({ id: "2", name: "Link" });

    server.shutdown();
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

    let server = new Server({
      environment: "test",
      factories: {
        contact: ContactFactory,
        friend: FriendFactory,
      },
    });

    let link = server.create("friend");
    let youngLink = server.create("friend", { age: 10 });

    expect(link).toEqual({ id: "1", name: "Link", age: 500, is_young: false });
    expect(youngLink).toEqual({
      id: "2",
      name: "Link",
      age: 10,
      is_young: true,
    });

    server.shutdown();
  });

  test("create allows for attr overrides with arrays", () => {
    let server = new Server({
      environment: "test",
      factories: {
        contact: Factory.extend({
          name: ["Sam", "Carl"],
        }),
      },
    });

    let sam = server.create("contact");
    let link = server.create("contact", { name: ["Link"] });
    let noname = server.create("contact", { name: [] });

    expect(sam).toEqual({ id: "1", name: ["Sam", "Carl"] });
    expect(link).toEqual({ id: "2", name: ["Link"] });
    expect(noname).toEqual({ id: "3", name: [] });

    server.shutdown();
  });

  test("create allows for nested attr overrides", () => {
    let server = new Server({
      environment: "test",
      factories: {
        contact: Factory.extend({
          address: {
            streetName: "Main",
            streetAddress(i) {
              return 1000 + i;
            },
          },
        }),
      },
    });

    let contact1 = server.create("contact");
    let contact2 = server.create("contact");

    expect(contact1).toEqual({
      id: "1",
      address: { streetName: "Main", streetAddress: 1000 },
    });
    expect(contact2).toEqual({
      id: "2",
      address: { streetName: "Main", streetAddress: 1001 },
    });

    server.shutdown();
  });

  test("factories can have dynamic properties that depend on attr overrides", () => {
    let server = new Server({
      environment: "test",
      factories: {
        baz: Factory.extend({
          bar() {
            return this.name.substr(1);
          },
        }),
      },
    });

    let baz1 = server.create("baz", { name: "foo" });

    expect(baz1).toEqual({ id: "1", name: "foo", bar: "oo" });

    server.shutdown();
  });

  test("create allows for arrays of attr overrides", () => {
    let server = new Server({
      environment: "test",
      factories: {
        contact: Factory.extend({
          websites: [
            "http://example.com",
            function (i) {
              return `http://placekitten.com/${320 + i}/${240 + i}`;
            },
          ],
        }),
      },
    });

    let contact1 = server.create("contact");
    let contact2 = server.create("contact");

    expect(contact1).toEqual({
      id: "1",
      websites: ["http://example.com", "http://placekitten.com/320/240"],
    });
    expect(contact2).toEqual({
      id: "2",
      websites: ["http://example.com", "http://placekitten.com/321/241"],
    });

    server.shutdown();
  });

  test("create allows to extend factory with trait", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),
    });

    let server = new Server({
      environment: "test",
      factories: {
        article: ArticleFactory,
      },
    });

    let article = server.create("article");
    let publishedArticle = server.create("article", "published");

    expect(article).toEqual({ id: "1", title: "Lorem ipsum" });
    expect(publishedArticle).toEqual({
      id: "2",
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
    });

    server.shutdown();
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

    let server = new Server({
      environment: "test",
      factories: {
        article: ArticleFactory,
      },
    });

    let article = server.create("article");
    let publishedArticle = server.create("article", "published");
    let publishedArticleWithContent = server.create(
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

    server.shutdown();
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

    let server = new Server({
      environment: "test",
      factories: {
        article: ArticleFactory,
        comment: CommentFactory,
      },
    });

    let articleWithComments = server.create("article", "withComments");

    expect(articleWithComments).toEqual({ id: "1", title: "Lorem ipsum" });
    expect(server.db.comments).toHaveLength(3);

    server.shutdown();
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

    let server = new Server({
      environment: "test",
      factories: {
        article: ArticleFactory,
        comment: CommentFactory,
      },
    });

    let articleWithComments = server.create("article");

    expect(articleWithComments).toEqual({ id: "1", title: "Lorem ipsum" });
    expect(server.db.comments).toHaveLength(0);

    server.shutdown();
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

    let server = new Server({
      environment: "test",
      factories: {
        article: ArticleFactory,
      },
    });

    let overrides = {
      publishedAt: "2012-01-01 10:00:00",
    };
    let publishedArticleWithContent = server.create(
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

    server.shutdown();
  });

  test("create allows to apply attr overrides containing afterCreate", () => {
    let CommentFactory = Factory.extend({
      content: "content",
    });
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",
    });

    let server = new Server({
      environment: "test",
      factories: {
        article: ArticleFactory,
        comment: CommentFactory,
      },
    });

    let articleWithComments = server.create("article", {
      afterCreate(article, server) {
        server.createList("comment", 3, { article });
      },
    });

    expect(articleWithComments).toEqual({ id: "1", title: "Lorem ipsum" });
    expect(server.db.comments).toHaveLength(3);

    server.shutdown();
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

    let server = new Server({
      environment: "test",
      factories: {
        article: ArticleFactory,
      },
    });

    expect(() => {
      server.create("article", "private");
    }).toThrow("'private' trait is not registered in 'article' factory");

    server.shutdown();
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

    let server = new Server({
      environment: "test",
      models: {
        author: Model.extend({
          articles: hasMany(),
        }),
        category: Model.extend({}),
        article: Model.extend({
          author: belongsTo(),
          awesomeCategory: belongsTo("category"),
        }),
      },
      factories: {
        article: ArticleFactory,
        author: AuthorFactory,
        category: CategoryFactory,
      },
    });

    let article = server.create("article", "withCategory");

    expect(article.attrs).toEqual({
      title: "Lorem ipsum",
      id: "1",
      authorId: "1",
      awesomeCategoryId: "1",
    });
    expect(server.db.authors).toHaveLength(1);
    expect(server.db.categories).toHaveLength(1);

    let anotherArticle = server.create("article", "withCategory");
    expect(anotherArticle.attrs).toEqual({
      title: "Lorem ipsum",
      id: "2",
      authorId: "2",
      awesomeCategoryId: "2",
    });
    expect(server.db.authors).toHaveLength(2);
    expect(server.db.categories).toHaveLength(2);

    server.shutdown();
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

    let server = new Server({
      environment: "test",
      factories: {
        article: ArticleFactory,
        category: CategoryFactory,
      },
      models: {
        category: Model.extend({}),
        article: Model.extend({
          category: belongsTo("category"),
        }),
      },
    });

    let article = server.create("article", "withCategory");

    expect(article.attrs).toEqual({
      title: "Lorem ipsum",
      id: "1",
      categoryId: "1",
    });
    expect(server.db.categories).toHaveLength(1);
    expect(server.db.categories[0]).toEqual({
      name: "splendid software",
      id: "1",
      isPublished: true,
      publishedAt: "2016-01-01 12:00:00",
    });

    server.shutdown();
  });

  test("create does not create (extra) models on associations when they are passed in as overrides", () => {
    let MotherFactory = Factory.extend({
      name: "Should not create",
    });
    let ChildFactory = Factory.extend({
      mother: association(),
    });

    let server = new Server({
      environment: "test",
      factories: {
        mother: MotherFactory,
        child: ChildFactory,
      },
      models: {
        mother: Model.extend({
          children: hasMany("child"),
        }),
        child: Model.extend({
          mother: belongsTo("mother"),
        }),
      },
    });

    let mother = server.create("mother", { name: "Lynda" });
    server.create("child", { name: "Don", mother });
    server.create("child", { name: "Dan", mother });

    expect(server.db.mothers).toHaveLength(1);

    server.shutdown();
  });
});

describe("Unit | Server #createList", function () {
  let server = null;
  beforeEach(function () {
    server = new Server({ environment: "test" });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("createList adds the given number of elements to the db", () => {
    server.loadFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    server.createList("contact", 3);
    let contactsInDb = server.db.contacts;

    expect(contactsInDb).toHaveLength(3);
    expect(contactsInDb[0]).toEqual({ id: "1", name: "Sam" });
    expect(contactsInDb[1]).toEqual({ id: "2", name: "Sam" });
    expect(contactsInDb[2]).toEqual({ id: "3", name: "Sam" });
  });

  test("createList returns the created elements", () => {
    server.loadFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    server.create("contact");
    let contacts = server.createList("contact", 3);

    expect(contacts).toHaveLength(3);
    expect(contacts[0]).toEqual({ id: "2", name: "Sam" });
    expect(contacts[1]).toEqual({ id: "3", name: "Sam" });
    expect(contacts[2]).toEqual({ id: "4", name: "Sam" });
  });

  test("createList respects sequences", () => {
    server.loadFactories({
      contact: Factory.extend({
        name(i) {
          return `name${i}`;
        },
      }),
    });

    let contacts = server.createList("contact", 3);

    expect(contacts[0]).toEqual({ id: "1", name: "name0" });
    expect(contacts[1]).toEqual({ id: "2", name: "name1" });
    expect(contacts[2]).toEqual({ id: "3", name: "name2" });
  });

  test("createList respects attr overrides", () => {
    server.loadFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    let sams = server.createList("contact", 2);
    let links = server.createList("contact", 2, { name: "Link" });

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

    server.loadFactories({
      article: ArticleFactory,
    });

    let articles = server.createList("article", 2, "published", "withContent");

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

    server.loadFactories({
      article: ArticleFactory,
    });

    let overrides = { publishedAt: "2012-01-01 10:00:00" };
    let articles = server.createList(
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

    server.loadFactories({
      article: ArticleFactory,
    });

    expect(() => {
      server.createList("article", 2, "private");
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

    server.loadFactories({
      article: ArticleFactory,
    });

    expect(() => {
      server.createList("article", "published");
    }).toThrow(
      "Mirage: second argument has to be an integer, you passed: string"
    );
  });
});

describe("Unit | Server #build", function () {
  let server = null;
  beforeEach(function () {
    server = new Server({ environment: "test" });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("build does not add the data to the db", () => {
    server.loadFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    server.build("contact");
    let contactsInDb = server.db.contacts;

    expect(contactsInDb).toHaveLength(0);
  });

  test("build returns the new attrs with no id", () => {
    server.loadFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    let contact = server.build("contact");

    expect(contact).toEqual({ name: "Sam" });
  });

  test("build allows for attr overrides", () => {
    server.loadFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    let sam = server.build("contact");
    let link = server.build("contact", { name: "Link" });

    expect(sam).toEqual({ name: "Sam" });
    expect(link).toEqual({ name: "Link" });
  });

  test("build allows for attr overrides with extended factories", () => {
    let ContactFactory = Factory.extend({
      name: "Link",
      age: 500,
    });
    let FriendFactory = ContactFactory.extend({
      is_young() {
        return this.age < 18;
      },
    });
    server.loadFactories({
      contact: ContactFactory,
      friend: FriendFactory,
    });

    let link = server.build("friend");
    let youngLink = server.build("friend", { age: 10 });

    expect(link).toEqual({ name: "Link", age: 500, is_young: false });
    expect(youngLink).toEqual({ name: "Link", age: 10, is_young: true });
  });

  test("build allows for attr overrides with arrays", () => {
    server.loadFactories({
      contact: Factory.extend({ name: ["Sam", "Carl"] }),
    });

    let sam = server.build("contact");
    let link = server.build("contact", { name: ["Link"] });
    let noname = server.build("contact", { name: [] });

    expect(sam).toEqual({ name: ["Sam", "Carl"] });
    expect(link).toEqual({ name: ["Link"] });
    expect(noname).toEqual({ name: [] });
  });

  test("build allows for nested attr overrides", () => {
    server.loadFactories({
      contact: Factory.extend({
        address: {
          streetName: "Main",
          streetAddress(i) {
            return 1000 + i;
          },
        },
      }),
    });

    let contact1 = server.build("contact");
    let contact2 = server.build("contact");

    expect(contact1).toEqual({
      address: { streetName: "Main", streetAddress: 1000 },
    });
    expect(contact2).toEqual({
      address: { streetName: "Main", streetAddress: 1001 },
    });
  });

  test("build allows for arrays of attr overrides", () => {
    server.loadFactories({
      contact: Factory.extend({
        websites: [
          "http://example.com",
          function (i) {
            return `http://placekitten.com/${320 + i}/${240 + i}`;
          },
        ],
      }),
    });

    let contact1 = server.build("contact");
    let contact2 = server.build("contact");

    expect(contact1).toEqual({
      websites: ["http://example.com", "http://placekitten.com/320/240"],
    });
    expect(contact2).toEqual({
      websites: ["http://example.com", "http://placekitten.com/321/241"],
    });
  });

  test("build allows to extend factory with trait", () => {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),
    });

    server.loadFactories({
      article: ArticleFactory,
    });

    let article = server.build("article");
    let publishedArticle = server.build("article", "published");

    expect(article).toEqual({ title: "Lorem ipsum" });
    expect(publishedArticle).toEqual({
      title: "Lorem ipsum",
      isPublished: true,
      publishedAt: "2010-01-01 10:00:00",
    });
  });

  test("build allows to extend factory with multiple traits", () => {
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

    server.loadFactories({
      article: ArticleFactory,
    });

    let article = server.build("article");
    let publishedArticle = server.build("article", "published");
    let publishedArticleWithContent = server.build(
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

  test("build allows to extend with multiple traits and to apply attr overrides", () => {
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

    server.loadFactories({
      article: ArticleFactory,
    });

    let overrides = {
      publishedAt: "2012-01-01 10:00:00",
    };
    let publishedArticleWithContent = server.build(
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

  test("build allows to build objects with associations", () => {
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

    server.loadFactories({
      article: ArticleFactory,
      author: AuthorFactory,
      category: CategoryFactory,
    });
    server.schema.registerModels({
      author: Model.extend({
        articles: hasMany(),
      }),
      category: Model.extend({}),
      article: Model.extend({
        author: belongsTo(),
        awesomeCategory: belongsTo("category"),
      }),
    });

    let article = server.build("article", "withCategory");

    expect(article).toEqual({
      title: "Lorem ipsum",
      authorId: "1",
      awesomeCategoryId: "1",
    });
    expect(server.db.authors).toHaveLength(1);
    expect(server.db.categories).toHaveLength(1);
  });

  test("build allows to build objects with associations with traits and overrides for associations", () => {
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

    server.config({
      factories: {
        article: ArticleFactory,
        category: CategoryFactory,
      },
      models: {
        category: Model.extend({}),
        article: Model.extend({
          category: belongsTo(),
        }),
      },
    });

    let article = server.build("article", "withCategory");

    expect(article).toEqual({ title: "Lorem ipsum", categoryId: "1" });
    expect(server.db.categories).toHaveLength(1);
    expect(server.db.categories[0]).toEqual({
      name: "splendid software",
      id: "1",
      isPublished: true,
      publishedAt: "2016-01-01 12:00:00",
    });
  });

  test("build throws errors when using trait that is not defined and distinquishes between traits and non-traits", () => {
    server.config({
      factories: {
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
      },
    });

    expect(() => {
      server.build("article", "private");
    }).toThrow("'private' trait is not registered in 'article' factory");
  });

  test("build does not build objects and throws error if model is not registered and association helper is used", () => {
    server.config({
      factories: {
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
      },
      models: {
        category: Model.extend(),
      },
    });

    expect(() => {
      server.build("article", "withCategory");
    }).toThrow("Mirage: Model not registered: article");
  });

  test("build does not build objects and throws error if model for given association is not registered", () => {
    server.config({
      factories: {
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
      },
      models: {
        article: Model.extend(),
      },
    });

    expect(() => {
      server.build("article", "withCategory");
    }).toThrow(
      "Mirage: You're using the `association` factory helper on the 'category' attribute of your article factory, but that attribute is not a `belongsTo` association."
    );
  });
});

describe("Unit | Server #buildList", function () {
  let server = null;
  beforeEach(function () {
    server = new Server({ environment: "test" });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("buildList does not add elements to the db", () => {
    server.loadFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    server.buildList("contact", 3);
    let contactsInDb = server.db.contacts;

    expect(contactsInDb).toHaveLength(0);
  });

  test("buildList returns the built elements without ids", () => {
    server.loadFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    server.create("contact");
    let contacts = server.buildList("contact", 3);

    expect(contacts).toHaveLength(3);
    expect(contacts[0]).toEqual({ name: "Sam" });
    expect(contacts[1]).toEqual({ name: "Sam" });
    expect(contacts[2]).toEqual({ name: "Sam" });
  });

  test("buildList respects sequences", () => {
    server.loadFactories({
      contact: Factory.extend({
        name(i) {
          return `name${i}`;
        },
      }),
    });

    let contacts = server.buildList("contact", 3);

    expect(contacts[0]).toEqual({ name: "name0" });
    expect(contacts[1]).toEqual({ name: "name1" });
    expect(contacts[2]).toEqual({ name: "name2" });
  });

  test("buildList respects attr overrides", () => {
    server.loadFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    let sams = server.buildList("contact", 2);
    let links = server.buildList("contact", 2, { name: "Link" });

    expect(sams[0]).toEqual({ name: "Sam" });
    expect(sams[1]).toEqual({ name: "Sam" });
    expect(links[0]).toEqual({ name: "Link" });
    expect(links[1]).toEqual({ name: "Link" });
  });

  test("buildList respects traits", () => {
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

    server.loadFactories({
      article: ArticleFactory,
    });

    let articles = server.buildList("article", 2, "published", "withContent");

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

  test("buildList respects traits with attr overrides", () => {
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

    server.loadFactories({
      article: ArticleFactory,
    });

    let overrides = { publishedAt: "2012-01-01 10:00:00" };
    let articles = server.buildList(
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

  test("buildList throws errors when using trait that is not defined and distinquishes between traits and non-traits", () => {
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

    server.loadFactories({
      article: ArticleFactory,
    });

    expect(() => {
      server.buildList("article", 2, "private");
    }).toThrow("'private' trait is not registered in 'article' factory");
  });

  test("buildList throws an error if the second argument is not an integer", function () {
    let ArticleFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
        publishedAt: "2010-01-01 10:00:00",
      }),
    });

    server.loadFactories({
      article: ArticleFactory,
    });

    expect(() => {
      server.buildList("article", "published");
    }).toThrow(
      "Mirage: second argument has to be an integer, you passed: string"
    );
  });
});
