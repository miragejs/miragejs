import assign from "lodash/assign";
import find from "lodash/find";
import isInteger from "lodash/isInteger";
import isPlainObject from "lodash/isPlainObject";
import assert from "../../assert";
import { camelize } from "../../utils/inflector";
import isAssociation from "../../utils/is-association";
import BelongsTo from "../associations/belongs-to";

class FactoryManager {
  constructor(schema) {
    this._schema = schema;

    /**
     * Registry of factories
     * @type {Object}
     * @private
     */
    this._registry = {};

    /**
     * Sequence of factories
     * @type {Object}
     * @private
     */
    this._sequences = {};
  }

  /**
   * Register factories in the schema.
   *
   * @method registerFactories
   * @param {Object} factoryMap
   * @public
   */
  registerFactories(factoryMap = {}) {
    // Store a reference to the factories
    let currentFactoryMap = this._registry;
    this._registry = assign(currentFactoryMap, factoryMap);

    // Create a collection for each factory
    Object.keys(factoryMap).forEach((type) => {
      let collectionName = this._schema.toCollectionName(type);
      this._schema.db.createCollection(collectionName);
    });
  }

  /**
   * Get the factory for a given type.
   *
   * @method factoryFor
   * @param {String} type
   * @public
   */
  factoryFor(type) {
    return this._registry[camelize(type)];
  }

  /**
   * Check if a factory exists for a given type.
   *
   * @method hasFactoryFor
   * @param {String} type
   * @public
   */
  hasFactoryFor(type) {
    return !!this.factoryFor(type);
  }

  /**
   * Build a factory.
   *
   * @method build
   * @param {String} type
   * @param {...Object} traitsAndOverrides
   * @public
   */
  build(type, ...traitsAndOverrides) {
    let traits = traitsAndOverrides.filter(
      (arg) => arg && typeof arg === "string"
    );
    let overrides = find(traitsAndOverrides, (arg) => isPlainObject(arg));
    let camelizedType = camelize(type);

    this._sequences[camelizedType] = this._sequences[camelizedType] + 1 || 0;

    let OriginalFactory = this.factoryFor(type);
    if (OriginalFactory) {
      OriginalFactory = OriginalFactory.extend({});
      let attrs = OriginalFactory.attrs || {};
      this._validateTraits(traits, OriginalFactory, type);
      let mergedExtensions = this._mergeExtensions(attrs, traits, overrides);
      this._mapAssociationsFromAttributes(type, attrs, overrides);
      this._mapAssociationsFromAttributes(type, mergedExtensions);

      let Factory = OriginalFactory.extend(mergedExtensions);
      let factory = new Factory();

      let sequence = this._sequences[camelizedType];
      return factory.build(sequence);
    } else {
      return overrides;
    }
  }

  /**
   * Build a list of factories.
   *
   * @method buildList
   * @param {String} type
   * @param {Number} amount
   * @param {...Object} traitsAndOverrides
   * @public
   */
  buildList(type, amount, ...traitsAndOverrides) {
    assert(
      isInteger(amount),
      `second argument has to be an integer, you passed: ${typeof amount}`
    );

    let list = [];

    const buildArgs = [type, ...traitsAndOverrides];
    for (let i = 0; i < amount; i++) {
      list.push(this.build.apply(this, buildArgs));
    }

    return list;
  }

  /**
   *
   * @private
   * @hide
   */
  _validateTraits(traits, factory, type) {
    traits.forEach((traitName) => {
      if (!factory.isTrait(traitName)) {
        throw new Error(
          `'${traitName}' trait is not registered in '${type}' factory`
        );
      }
    });
  }

  /**
   *
   * @private
   * @hide
   */
  _mergeExtensions(attrs, traits, overrides) {
    let allExtensions = traits.map((traitName) => {
      return attrs[traitName].extension;
    });
    allExtensions.push(overrides || {});
    return allExtensions.reduce((accum, extension) => {
      return assign(accum, extension);
    }, {});
  }

  /**
   *
   * @private
   * @hide
   */
  _mapAssociationsFromAttributes(modelName, attributes, overrides = {}) {
    Object.keys(attributes || {})
      .filter((attr) => {
        return isAssociation(attributes[attr]);
      })
      .forEach((attr) => {
        let modelClass = this._schema.modelClassFor(modelName);
        let association = modelClass.associationFor(attr);

        assert(
          association && association instanceof BelongsTo,
          `You're using the \`association\` factory helper on the '${attr}' attribute of your ${modelName} factory, but that attribute is not a \`belongsTo\` association.`
        );

        let isSelfReferentialBelongsTo =
          association &&
          association instanceof BelongsTo &&
          association.modelName === modelName;

        assert(
          !isSelfReferentialBelongsTo,
          `You're using the association() helper on your ${modelName} factory for ${attr}, which is a belongsTo self-referential relationship. You can't do this as it will lead to infinite recursion. You can move the helper inside of a trait and use it selectively.`
        );

        let isPolymorphic =
          association && association.opts && association.opts.polymorphic;

        assert(
          !isPolymorphic,
          `You're using the association() helper on your ${modelName} factory for ${attr}, which is a polymorphic relationship. This is not currently supported.`
        );

        let factoryAssociation = attributes[attr];
        let foreignKey = `${camelize(attr)}Id`;
        if (!overrides[attr]) {
          attributes[foreignKey] = this._schema.create(
            association.modelName,
            ...factoryAssociation.traitsAndOverrides
          ).id;
        }
        delete attributes[attr];
      });
  }
}

export default FactoryManager;
