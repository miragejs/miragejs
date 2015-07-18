import Factory from './factory';
import Response from './response';
import faker from './faker';
import Model from './orm/model';
import hasMany from './orm/associations/has-many';
import belongsTo from './orm/associations/belongs-to';

export { faker, Model, hasMany, belongsTo };

export default {
  Factory: Factory,
  Response: Response,
  hasMany: function(type) {
    return new hasMany(type);
  },
  belongsTo: function(type) {
    return new belongsTo(type);
  }
};
