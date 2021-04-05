import {
  Server,
  ActiveModelSerializer,
  Model,
  hasMany,
  belongsTo,
} from "miragejs";

describe("External | Shared | Serializers | ActiveModelSerializer", () => {
  let server;

  afterEach(function () {
    server.shutdown();
  });

  describe("with serializeIds as included", () => {
    beforeEach(function () {
      server = new Server({
        models: {
          wordSmith: Model.extend({
            blogPosts: hasMany(),
          }),
          blogPost: Model.extend({
            wordSmith: belongsTo(),
            comments: hasMany(),
          }),
          user: Model.extend({
            contactInfos: hasMany(),
          }),
          contactInfo: Model.extend({
            user: belongsTo(),
          }),
          comment: Model.extend({
            commentable: belongsTo({ polymorphic: true }),
          }),
          team: Model.extend({
            users: hasMany(),
            comments: hasMany(),
          }),
        },
        serializers: {
          application: ActiveModelSerializer,
          wordSmith: ActiveModelSerializer.extend({
            serializeIds: "included",
            attrs: ["id", "name"],
            include: ["blogPosts"],
          }),
          blogPost: ActiveModelSerializer.extend({
            serializeIds: "included",
            include: ["wordSmith", "comments"],
          }),
          comment: ActiveModelSerializer.extend({
            serializeIds: "included",
            include: ["commentable"],
          }),
          contactInfo: ActiveModelSerializer.extend({
            serializeIds: "included",
            include: ["user"],
          }),
          user: ActiveModelSerializer.extend({
            serializeIds: "included",
            attrs: ["id", "name"],
            include: ["contactInfos"],
            embed: true,
          }),
          team: ActiveModelSerializer.extend({
            serializeIds: "included",
            attrs: ["id", "name"],
            include: ["users", "comments"],
            embed: (key) => key === "comments",
          }),
        },
      });

      let link = server.schema.wordSmiths.create({ name: "Link", age: 123 });
      let post1 = link.createBlogPost({ title: "Lorem" });
      link.createBlogPost({ title: "Ipsum" });

      server.schema.wordSmiths.create({ name: "Zelda", age: 230 });

      let user = server.schema.users.create({ name: "John Peach", age: 123 });
      user.createContactInfo({ email: "peach@bb.me" });
      user.createContactInfo({ email: "john3000@mail.com" });

      server.schema.users.create({ name: "Pine Apple", age: 230 });
      server.schema.comments.create({ text: "Hi there", commentable: post1 });

      let team = server.schema.teams.create({
        name: "Blue Team",
        users: [user],
      });
      server.schema.comments.create({
        text: "Blue team, go!",
        commentable: team,
      });
    });

    test("it sideloads associations and snake-cases relationships and attributes correctly for a model", () => {
      let link = server.schema.wordSmiths.find(1);
      let result = server.serializerOrRegistry.serialize(link);

      expect(result).toEqual({
        word_smith: {
          id: "1",
          name: "Link",
          blog_post_ids: ["1", "2"],
        },
        blog_posts: [
          {
            id: "1",
            title: "Lorem",
            word_smith_id: "1",
            comment_ids: ["1"],
          },
          {
            id: "2",
            title: "Ipsum",
            word_smith_id: "1",
            comment_ids: [],
          },
        ],
        comments: [
          {
            id: "1",
            text: "Hi there",
            commentable_id: "1",
            commentable_type: "blog-post",
          },
        ],
      });
    });

    test("it sideloads associations and snake-cases relationships and attributes correctly for a collection", () => {
      let wordSmiths = server.schema.wordSmiths.all();
      let result = server.serializerOrRegistry.serialize(wordSmiths);

      expect(result).toEqual({
        word_smiths: [
          {
            id: "1",
            name: "Link",
            blog_post_ids: ["1", "2"],
          },
          {
            id: "2",
            name: "Zelda",
            blog_post_ids: [],
          },
        ],
        blog_posts: [
          {
            id: "1",
            title: "Lorem",
            word_smith_id: "1",
            comment_ids: ["1"],
          },
          {
            id: "2",
            title: "Ipsum",
            word_smith_id: "1",
            comment_ids: [],
          },
        ],
        comments: [
          {
            id: "1",
            text: "Hi there",
            commentable_id: "1",
            commentable_type: "blog-post",
          },
        ],
      });
    });

    test("it embeds all associations and snake-cases relationships and attributes correctly for a collection", () => {
      let users = server.schema.users.all();
      let result = server.serializerOrRegistry.serialize(users);

      expect(result).toEqual({
        users: [
          {
            id: "1",
            name: "John Peach",
            contact_infos: [
              {
                id: "1",
                email: "peach@bb.me",
                user_id: "1",
              },
              {
                id: "2",
                email: "john3000@mail.com",
                user_id: "1",
              },
            ],
          },
          {
            id: "2",
            name: "Pine Apple",
            contact_infos: [],
          },
        ],
      });
    });

    test("it embeds some associations and snake-cases relationships and attributes correctly for a collection", () => {
      let teams = server.schema.teams.all();
      let result = server.serializerOrRegistry.serialize(teams);

      expect(result).toEqual({
        teams: [
          {
            id: "1",
            name: "Blue Team",
            comments: [
              {
                text: "Blue team, go!",
                id: "2",
                commentable_type: "team",
                commentable_id: "1",
              },
            ],
            user_ids: ["1"],
          },
        ],
        users: [
          {
            id: "1",
            name: "John Peach",
            contact_infos: [
              { email: "peach@bb.me", id: "1", user_id: "1" },
              { email: "john3000@mail.com", id: "2", user_id: "1" },
            ],
          },
        ],
      });
    });
  });

  describe("with serializeIds as always", () => {
    test("it correctly serializes a Collection for a model that has a polymorphic relationship", () => {
      server = new Server({
        models: {
          post: Model,
          comment: Model.extend({
            commentable: belongsTo({ polymorphic: true }),
          }),
        },

        serializers: {
          application: ActiveModelSerializer.extend({
            serializeIds: "always",
          }),
        },
      });

      server.schema.comments.create({
        commentable: server.schema.posts.create(),
      });

      let serializedComments = server.serializerOrRegistry.serialize(
        server.schema.comments.all()
      );

      expect(serializedComments).toEqual({
        comments: [
          {
            id: "1",
            commentable_id: "1",
            commentable_type: "post",
          },
        ],
      });
    });
  });
});
