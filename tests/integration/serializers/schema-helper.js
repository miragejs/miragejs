import Mirage from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';

export default {

  setup() {
    let db = new Db();
    this.schema = new Schema(db);
    this.schema.registerModels({
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
      greatPhoto: Model
    });

    return this.schema;
  }

};
