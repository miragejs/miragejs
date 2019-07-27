import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import SerializerRegistry from "@lib/serializer-registry";
import { Model, hasMany, belongsTo, JSONAPISerializer } from "@miragejs/server";

describe("Integration | Serializers | JSON API Serializer | Associations | Collection", () => {
  let schema;

  beforeEach(() => {
    schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        posts: hasMany("blogPost", { inverse: "author" })
      }),
      blogPost: Model.extend({
        author: belongsTo("wordSmith", { inverse: "posts" }),
        comments: hasMany("fineComment", { inverse: "post" })
      }),
      fineComment: Model.extend({
        post: belongsTo("blogPost")
      })
    });
  });

  test(`by default, it doesn't include a collection's relationships if those relationships are not included in the document and no links are defined`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer
    });
    schema.wordSmiths.create({ firstName: "Link", age: 123 });
    schema.wordSmiths.create({ firstName: "Zelda", age: 456 });

    let collection = schema.wordSmiths.all();
    let result = registry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
            age: 123
          }
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda",
            age: 456
          }
        }
      ]
    });
  });

  test(`when alwaysIncludeLinkageData is true, it contains linkage data for all a collection's relationships, regardless of includes`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer.extend({
        alwaysIncludeLinkageData: true
      })
    });
    schema.wordSmiths.create({ firstName: "Link", age: 123 });
    schema.wordSmiths.create({ firstName: "Zelda", age: 456 });

    let collection = schema.wordSmiths.all();
    let result = registry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
            age: 123
          },
          relationships: {
            posts: {
              data: []
            }
          }
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda",
            age: 456
          },
          relationships: {
            posts: {
              data: []
            }
          }
        }
      ]
    });
  });

  test(`when shouldIncludeLinkageData returns true for a relationship, it contains linkage data for that relationship on all of the collection, regardless of includes`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer.extend({
        shouldIncludeLinkageData(relationshipKey, model) {
          if (relationshipKey == "posts") {
            return true;
          }
        }
      })
    });
    schema.wordSmiths.create({ firstName: "Link", age: 123 });
    schema.wordSmiths.create({ firstName: "Zelda", age: 456 });

    let collection = schema.wordSmiths.all();
    let result = registry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
            age: 123
          },
          relationships: {
            posts: {
              data: []
            }
          }
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda",
            age: 456
          },
          relationships: {
            posts: {
              data: []
            }
          }
        }
      ]
    });
  });

  test(`it includes linkage data for a has-many relationship that's being included`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer,
      wordSmith: JSONAPISerializer.extend({
        include: ["posts"]
      })
    });
    let link = schema.wordSmiths.create({ firstName: "Link" });
    link.createPost({ title: "Lorem" });
    link.createPost({ title: "Ipsum" });
    schema.wordSmiths.create({ firstName: "Zelda" });

    let collection = schema.wordSmiths.all();
    let result = registry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link"
          },
          relationships: {
            posts: {
              data: [
                { type: "blog-posts", id: "1" },
                { type: "blog-posts", id: "2" }
              ]
            }
          }
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda"
          },
          relationships: {
            posts: {
              data: []
            }
          }
        }
      ],
      included: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {
            title: "Lorem"
          }
        },
        {
          type: "blog-posts",
          id: "2",
          attributes: {
            title: "Ipsum"
          }
        }
      ]
    });
  });

  test(`it can serialize a collection with a chain of has-many relationships`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer,
      wordSmith: JSONAPISerializer.extend({
        include: ["posts"]
      }),
      blogPost: JSONAPISerializer.extend({
        include: ["comments"]
      })
    });

    let link = schema.wordSmiths.create({ firstName: "Link" });
    let lorem = link.createPost({ title: "Lorem" });
    lorem.createComment({ text: "pwned" });
    link.createPost({ title: "Ipsum" });
    schema.wordSmiths.create({ firstName: "Zelda" });

    let collection = schema.wordSmiths.all();
    let result = registry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link"
          },
          relationships: {
            posts: {
              data: [
                { type: "blog-posts", id: "1" },
                { type: "blog-posts", id: "2" }
              ]
            }
          }
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda"
          },
          relationships: {
            posts: {
              data: []
            }
          }
        }
      ],
      included: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {
            title: "Lorem"
          },
          relationships: {
            comments: {
              data: [{ type: "fine-comments", id: "1" }]
            }
          }
        },
        {
          type: "fine-comments",
          id: "1",
          attributes: {
            text: "pwned"
          }
        },
        {
          type: "blog-posts",
          id: "2",
          attributes: {
            title: "Ipsum"
          },
          relationships: {
            comments: {
              data: []
            }
          }
        }
      ]
    });
  });

  test(`it can serialize a collection with a belongs-to relationship`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer,
      blogPost: JSONAPISerializer.extend({
        include: ["author"]
      })
    });

    let link = schema.wordSmiths.create({ firstName: "Link" });
    let post = link.createPost({ title: "Lorem" });
    post.createComment();
    link.createPost({ title: "Ipsum" });
    schema.wordSmiths.create({ firstName: "Zelda" });

    let blogPosts = schema.blogPosts.all();
    let result = registry.serialize(blogPosts);

    expect(result).toEqual({
      data: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {
            title: "Lorem"
          },
          relationships: {
            author: {
              data: { type: "word-smiths", id: "1" }
            }
          }
        },
        {
          type: "blog-posts",
          id: "2",
          attributes: {
            title: "Ipsum"
          },
          relationships: {
            author: {
              data: { type: "word-smiths", id: "1" }
            }
          }
        }
      ],
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link"
          }
        }
      ]
    });
  });

  test(`it can serialize a collection with a chain of belongs-to relationships`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer,
      fineComment: JSONAPISerializer.extend({
        include: ["post"]
      }),
      blogPost: JSONAPISerializer.extend({
        include: ["author"]
      })
    });

    let link = schema.wordSmiths.create({ firstName: "Link" });
    let post = link.createPost({ title: "Lorem" });
    post.createComment({ text: "pwned" });
    link.createPost({ title: "Ipsum" });
    schema.wordSmiths.create({ firstName: "Zelda" });

    let fineComments = schema.fineComments.all();
    let result = registry.serialize(fineComments);

    expect(result).toEqual({
      data: [
        {
          type: "fine-comments",
          id: "1",
          attributes: {
            text: "pwned"
          },
          relationships: {
            post: {
              data: { type: "blog-posts", id: "1" }
            }
          }
        }
      ],
      included: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {
            title: "Lorem"
          },
          relationships: {
            author: {
              data: { type: "word-smiths", id: "1" }
            }
          }
        },
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link"
          }
        }
      ]
    });
  });

  test(`it propertly serializes complex relationships`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer,
      blogPost: JSONAPISerializer.extend({
        include: ["author", "comments"]
      }),
      wordSmith: JSONAPISerializer.extend({
        include: ["posts"]
      }),
      fineComment: JSONAPISerializer.extend({
        include: ["post"]
      })
    });

    let link = schema.wordSmiths.create({ firstName: "Link" });
    let post = link.createPost({ title: "Lorem" });
    post.createComment({ text: "pwned" });
    link.createPost({ title: "Ipsum" });
    schema.wordSmiths.create({ firstName: "Zelda" });

    let blogPost = schema.blogPosts.find(1);
    let result = registry.serialize(blogPost);

    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {
          title: "Lorem"
        },
        relationships: {
          author: {
            data: { type: "word-smiths", id: "1" }
          },
          comments: {
            data: [{ type: "fine-comments", id: "1" }]
          }
        }
      },
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link"
          },
          relationships: {
            posts: {
              data: [
                {
                  id: "1",
                  type: "blog-posts"
                },
                {
                  id: "2",
                  type: "blog-posts"
                }
              ]
            }
          }
        },
        {
          type: "blog-posts",
          id: "2",
          attributes: {
            title: "Ipsum"
          },
          relationships: {
            author: {
              data: { type: "word-smiths", id: "1" }
            },
            comments: {
              data: []
            }
          }
        },
        {
          type: "fine-comments",
          id: "1",
          attributes: {
            text: "pwned"
          },
          relationships: {
            post: {
              data: {
                id: "1",
                type: "blog-posts"
              }
            }
          }
        }
      ]
    });
  });
});
