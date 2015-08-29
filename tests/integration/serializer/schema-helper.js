import Mirage from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';

export default {

  setup() {
    let db = new Db();
    this.schema = new Schema(db);
    this.schema.registerModels({
      author: Model.extend({
        posts: Mirage.hasMany()
      }),
      post: Model.extend({
        author: Mirage.belongsTo(),
        comments: Mirage.hasMany()
      }),
      comment: Model.extend({
        post: Mirage.belongsTo()
      }),
      photo: Model
    });

    return this.schema;
  }

};
