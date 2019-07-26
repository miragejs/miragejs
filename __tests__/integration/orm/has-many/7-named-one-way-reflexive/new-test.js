import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named One-Way Reflexive | new', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test('the parent accepts a saved child id', assert => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({
      labelIds: [ tagA.id ]
    });

    expect(tagB.labelIds).toEqual([ tagA.id ]);
    expect(tagB.labels.includes(tagA)).toBeTruthy();
  });

  test('the parent errors if the children ids don\'t exist', assert => {
    expect(function() {
      this.schema.tags.new({ labelIds: [ 2 ] });
    }).toThrow();
  });

  test('the parent accepts null children foreign key', assert => {
    let tag = this.schema.tags.new({ labelIds: null });

    expect(tag.labels.models.length).toEqual(0);
    expect(tag.labelIds).toEqual([]);
    expect(tag.attrs).toEqual({ labelIds: null });
  });

  test('the parent accepts saved children', assert => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({ labels: [ tagA ] });

    expect(tagB.labelIds).toEqual([ tagA.id ]);
    expect(tagB.labels.models[0]).toEqual(tagA);
  });

  test('the parent accepts new children', assert => {
    let tagA = this.schema.tags.new({ color: 'Red' });
    let tagB = this.schema.tags.new({ labels: [ tagA ] });

    expect(tagB.labelIds).toEqual([ undefined ]);
    expect(tagB.labels.models[0]).toEqual(tagA);
  });

  test('the parent accepts null children', assert => {
    let tag = this.schema.tags.new({ labels: null });

    expect(tag.labels.models.length).toEqual(0);
    expect(tag.labelIds).toEqual([]);
    expect(tag.attrs).toEqual({ labelIds: null });
  });

  test('the parent accepts children and child ids', assert => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({ labels: [ tagA ], labelIds: [ tagA.id ] });

    expect(tagB.labelIds).toEqual([ tagA.id ]);
    expect(tagB.labels.models[0]).toEqual(tagA);
  });

  test('the parent accepts no reference to children or child ids as empty obj', assert => {
    let tag = this.schema.tags.new({});

    expect(tag.labelIds).toEqual([]);
    expect(tag.labels.models).toEqual([]);
    expect(tag.attrs).toEqual({ labelIds: null });
  });

  test('the parent accepts no reference to children or child ids', assert => {
    let tag = this.schema.tags.new();

    expect(tag.labelIds).toEqual([]);
    expect(tag.labels.models).toEqual([]);
    expect(tag.attrs).toEqual({ labelIds: null });
  });
});
