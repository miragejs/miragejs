import Model from './orm/model';
import _assign from 'lodash/object/assign';
import _compose from 'lodash/function/compose';
import extend from './utils/extend';
import { singularize, pluralize, camelize } from './utils/inflector';

class Serializer {

  serialize(response /*, request */) {
    if (response instanceof Model) {
      return this._attrsForModel(response);
    } else {
      return response;
    }
  }

  /*
    Used to format the key of a primary model.
  */
  keyForModel(modelName) {
    return camelize(modelName);
  }

  /*
    Used to format the key of a primary collection.
  */
  keyForCollection(modelName) {
    return pluralize(this.keyForModel(modelName));
  }

  /*
    Used to format attributes on a model.
  */
  keyForAttribute(attr) {
    return attr;
  }

  /*
    Use this hook to format the key for collections
    related to this model.

    For example, if you're serializing an author that
    side loads many `blogPosts`, you would get `blogPost`
    as an argument, and whatever you return would
    end up as the collection key in your JSON:

    keyForRelationship(type) {
      return dasherize(type);
    }

    {
      author: {...},
      'blog-posts': [...]
    }
  */
  keyForRelationship(modelName) {
    return _compose(camelize, pluralize)(modelName);
  }

  /*
    Use this hook to format the key for relationship ids
    in this model's JSON representation.

    For example, if you're serializing an author that
    side loads many `blogPosts`, you would get `blogPost`
    as an argument, and whatever you return would
    end up as part of the `author` JSON:

    keyForRelationshipIds(type) {
      return dasherize(type) + '-ids';
    }

    {
      author: {
        ...,
        'blog-post-ids': [1, 2, 3]
      },
      'blog-posts': [...]
    }
  */
  keyForRelationshipIds(modelName) {
    return `${singularize(camelize(modelName))}Ids`;
  }

  /*
    Use this method to convert a JSON payload sent from your Ember app
    (for example in a POST or PUT) into a JSON:API document, in order to
    use Mirage's shorthands.
  */
  normalize(json) {
    return json;
  }

  /*
    Private methods
  */
  _attrsForModel(model) {
    let attrs = {};

    if (this.attrs) {
      attrs = this.attrs.reduce((memo, attr) => {
        memo[attr] = model[attr];
        return memo;
      }, {});
    } else {
      attrs = _assign(attrs, model.attrs);
    }

    return this._formatAttributeKeys(attrs);
  }

  _formatAttributeKeys(attrs) {
    let formattedAttrs = {};

    for (let key in attrs) {
      let formattedKey = this.keyForAttribute(key);
      formattedAttrs[formattedKey] = attrs[key];
    }

    return formattedAttrs;
  }
}

// Defaults
Serializer.prototype.include = [];
Serializer.prototype.root = true;
Serializer.prototype.embed = false;

Serializer.extend = extend;

export default Serializer;
