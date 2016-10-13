import Mirage from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';

export default {

  setup() {
    return new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: Mirage.hasMany()
      }),
      blogPost: Model.extend({
        wordSmith: Mirage.belongsTo(),
        fineComments: Mirage.hasMany()
      }),
      fineComment: Model.extend({
        blogPost: Mirage.belongsTo()
      }),
      greatPhoto: Model,

      foo: Model.extend({
        bar: Mirage.belongsTo()
      }),
      bar: Model.extend({
        baz: Mirage.belongsTo()
      }),
      baz: Model.extend({
        quuxes: Mirage.hasMany()
      }),
      quux: Model.extend({
        zomgs: Mirage.hasMany()
      }),
      zomg: Model.extend({
        lol: Mirage.belongsTo()
      }),
      lol: Model
    });
  }

};
