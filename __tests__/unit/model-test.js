import { Model } from '../../lib';

describe('Unit | Model', function() {
  test('it can be instantiated', assert => {
    let model = new Model({}, 'user');
    expect(model).toBeTruthy();
  });

  test('it cannot be instantiated without a schema', assert => {
    expect(function() {
      new Model();
    }).toThrow();
  });

  test('it cannot be instantiated without a modelName', assert => {
    expect(function() {
      new Model({});
    }).toThrow();
  });

  test('findBelongsToAssociation returns association for given type if defined', assert => {
    let ModelClass = Model.extend();
    let authorAssociationMock = {};
    ModelClass.prototype.belongsToAssociations = {
      author: authorAssociationMock
    };

    expect(ModelClass.findBelongsToAssociation('article')).toBeNull();
    expect(ModelClass.findBelongsToAssociation('author')).toEqual(authorAssociationMock);
  });
});
