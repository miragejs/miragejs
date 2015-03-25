import Factory from './factory';
import Response from './response';
import faker from './faker';
import HasMany from './orm/associations/has-many';
import BelongsTo from './orm/associations/belongs-to';

export { faker };

export default {
  Factory: Factory,
  Response: Response,
  hasMany: function(type) {
    return new HasMany(type);
  },
  belongsTo: function(type) {
    return new BelongsTo(type);
  }
};
