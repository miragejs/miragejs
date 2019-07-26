import { Model, hasMany, _Db as Db, _ormSchema as Schema } from '@miragejs/server';

/*
  A model with a hasMany association can be in eight states
  with respect to its association. This helper class
  returns a parent (and its children) in these various states.

  The return value is an array of the form

    [ parent, [child1, child2...] ]

  where the children array may be empty.
*/
export default class Helper {

  constructor() {
    this.db = new Db();

    this.schema = new Schema(this.db, {
      tag: Model.extend({
        labels: hasMany('tag', { inverse: 'labels' }) // implicit inverse
      })
    });
  }

  savedParentNoChildren() {
    let tag = this.db.tags.insert({ name: 'Red' });

    return [ this.schema.tags.find(tag.id), [] ];
  }

  savedParentNewChildren() {
    let tag = this.schema.tags.create({ name: 'Red' });
    let tag1 = this.schema.tags.new({ name: 'Blue' });
    let tag2 = this.schema.tags.new({ name: 'Green' });

    tag.labels = [ tag1, tag2 ];

    return [ tag, [ tag1, tag2 ] ];
  }

  savedParentSavedChildren() {
    let { schema } = this;
    schema.db.tags.insert([
      { id: '1', name: 'Red', labelIds: ['2', '3'] },
      { id: '2', name: 'Blue', labelIds: ['1'] },
      { id: '3', name: 'Green', labelIds: ['1'] }
    ]);

    return [ schema.tags.find(1), [ schema.tags.find(2), schema.tags.find(3) ] ];
  }

  savedParentMixedChildren() {
    this.schema.db.tags.insert([
      { id: '1', name: 'Red', labelIds: ['2'] },
      { id: '2', name: 'Blue', labelIds: ['1'] }
    ]);
    let tag = this.schema.tags.find(1);
    let blueTag = this.schema.tags.find(2);
    let greenTag = this.schema.tags.new({ name: 'Green' });

    tag.labels = [ blueTag, greenTag ];

    return [ tag, [ blueTag, greenTag ] ];
  }

  newParentNoChildren() {
    let tag = this.schema.tags.new({ name: 'Red' });

    return [ tag, [] ];
  }

  newParentNewChildren() {
    let tag = this.schema.tags.new({ name: 'Red' });
    let tag1 = this.schema.tags.new({ name: 'Blue' });
    let tag2 = this.schema.tags.new({ name: 'Green' });

    tag.labels = [ tag1, tag2 ];

    return [ tag, [ tag1, tag2 ] ];
  }

  newParentSavedChildren() {
    let tag = this.schema.tags.new({ name: 'Red' });
    let tag1 = this.schema.tags.create({ name: 'Blue' });
    let tag2 = this.schema.tags.create({ name: 'Green' });

    tag.labels = [ tag1, tag2 ];

    return [ tag, [ tag1, tag2 ] ];
  }

  newParentMixedChildren() {
    let tag = this.schema.tags.new({ name: 'Red' });
    let tag1 = this.schema.tags.create({ name: 'Blue' });
    let tag2 = this.schema.tags.new({ name: 'Green' });

    tag.labels = [ tag1, tag2 ];

    return [ tag, [ tag1, tag2 ] ];
  }

  // Unassociated child models, used for setting tests
  savedChild() {
    let insertedTag = this.db.tags.insert({ name: 'Blue' });

    return this.schema.tags.find(insertedTag.id);
  }

  newChild() {
    return this.schema.tags.new({ name: 'Blue' });
  }

}

export const states = [
  'savedParentNoChildren',
  'savedParentNewChildren',
  'savedParentMixedChildren',
  'savedParentSavedChildren',
  'newParentNoChildren',
  'newParentNewChildren',
  'newParentSavedChildren',
  'newParentMixedChildren'
];
