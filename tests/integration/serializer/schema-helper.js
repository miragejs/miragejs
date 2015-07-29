import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';

export default {

  setup() {
    let db = new Db();
    this.schema = new Schema(db);
    this.schema.registerModel('user', Model.extend());
  },

  emptyData() {
    this.schema.db.emptyData();
  },

  getUserModel(attrs) {
    return this.schema.user.create(attrs);
  },

  getUserCollection(attrsArray) {
    attrsArray.forEach(attrs => {
      this.schema.user.create(attrs);
    });

    return this.schema.user.all();
  }
};
