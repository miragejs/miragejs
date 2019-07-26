import Helper from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Has Many | Reflexive | new', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test('the parent accepts a saved child id', assert => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({
      tagIds: [ tagA.id ]
    });

    expect(tagB.tagIds).toEqual([ tagA.id ]);
    expect(tagB.tags.includes(tagA)).toBeTruthy();
  });

  test('the parent errors if the children ids don\'t exist', assert => {
    expect(function() {
      this.schema.tags.new({ tagIds: [ 2 ] });
    }).toThrow();
  });

  test('the parent accepts null children foreign key', assert => {
    let tag = this.schema.tags.new({ tagIds: null });

    expect(tag.tags.models.length).toEqual(0);
    expect(tag.tagIds).toEqual([]);
    expect(tag.attrs).toEqual({ tagIds: null });
  });

  test('the parent accepts saved children', assert => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({ tags: [ tagA ] });

    expect(tagB.tagIds).toEqual([ tagA.id ]);
    expect(tagB.tags.models[0]).toEqual(tagA);
  });

  test('the parent accepts new children', assert => {
    let tagA = this.schema.tags.new({ color: 'Red' });
    let tagB = this.schema.tags.new({ tags: [ tagA ] });

    expect(tagB.tagIds).toEqual([ undefined ]);
    expect(tagB.tags.models[0]).toEqual(tagA);
  });

  test('the parent accepts null children', assert => {
    let tag = this.schema.tags.new({ tags: null });

    expect(tag.tags.models.length).toEqual(0);
    expect(tag.tagIds).toEqual([]);
    expect(tag.attrs).toEqual({ tagIds: null });
  });

  test('the parent accepts children and child ids', assert => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({ tags: [ tagA ], tagIds: [ tagA.id ] });

    expect(tagB.tagIds).toEqual([ tagA.id ]);
    expect(tagB.tags.models[0]).toEqual(tagA);
  });

  test('the parent accepts no reference to children or child ids as empty obj', assert => {
    let tag = this.schema.tags.new({});

    expect(tag.tagIds).toEqual([]);
    expect(tag.tags.models).toEqual([]);
    expect(tag.attrs).toEqual({ tagIds: null });
  });

  test('the parent accepts no reference to children or child ids', assert => {
    let tag = this.schema.tags.new();

    expect(tag.tagIds).toEqual([]);
    expect(tag.tags.models).toEqual([]);
    expect(tag.attrs).toEqual({ tagIds: null });
  });
});
