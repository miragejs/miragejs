import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';

export default {

  setup() {
    let db = new Db();
    this.schema = new Schema(db);
    this.schema.registerModels({
      author: Model.extend(),
      post: Model.extend(),
    });
  },

  emptyData() {
    this.schema.db.emptyData();
  },

  getModel(type, attrs) {
    return this.schema[type].create(attrs);
  },

  getCollection(type, attrsArray) {
    attrsArray.forEach(attrs => {
      this.schema[type].create(attrs);
    });

    return this.schema[type].all();
  }
};
