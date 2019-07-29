import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import { Model, hasMany, belongsTo } from "@miragejs/server/orm/model";

export default {
  setup() {
    return new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: hasMany()
      }),
      blogPost: Model.extend({
        wordSmith: belongsTo(),
        fineComments: hasMany()
      }),
      fineComment: Model.extend({
        blogPost: belongsTo()
      }),
      greatPhoto: Model,

      foo: Model.extend({
        bar: belongsTo()
      }),
      bar: Model.extend({
        baz: belongsTo()
      }),
      baz: Model.extend({
        quuxes: hasMany()
      }),
      quux: Model.extend({
        zomgs: hasMany()
      }),
      zomg: Model.extend({
        lol: belongsTo()
      }),
      lol: Model
    });
  }
};
