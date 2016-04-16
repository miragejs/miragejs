import Model from './orm/model';
import _assign from 'lodash/object/assign';
import _compose from 'lodash/function/compose';
import extend from './utils/extend';
import { singularize, pluralize, camelize } from './utils/inflector';

class Serializer {

  /**
  Override this method to implement your own custom
  serialize function. response is whatever was returned
  from your route handler, and request is the Pretender
  request object. Returns a plain JavaScript object or
  array, which Mirage uses as the response data to your
  Ember app’s XHR request. You can also override this method,
  call super, and manipulate the data before Mirage responds
  with it. This is a great place to add metadata, or for
  one-off operations that don’t fit neatly into any of
  Mirage’s other abstractions.
  @method serialize
  @param response
  @param request
  @public
  */
  serialize(response /*, request */) {
    if (response instanceof Model) {
      return this._attrsForModel(response);
    } else {
      return response;
    }
  }

  /**
    Used to define a custom key when serializing a
    primary model of modelName `modelName`.
    @method keyForModel
    @param modelName
    @public
  */
  keyForModel(modelName) {
    return camelize(modelName);
  }

  /**
    Used to customize the key when serializing a primary
    collection. By default this pluralizes the return
    value of `keyForModel`.
    @method keyForCollection
    @param modelName
    @public
  */
  keyForCollection(modelName) {
    return pluralize(this.keyForModel(modelName));
  }

  /**
    Used to customize how a model’s attribute is
    formatted in your JSON payload.
    @method keyForAttribute
    @param attr
    @public
  */
  keyForAttribute(attr) {
    return attr;
  }

  /**
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
    @method keyForRelationship
    @param modelName
    @public
  */
  keyForRelationship(modelName) {
    return _compose(camelize, pluralize)(modelName);
  }

  /**
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
    @method keyForRelationshipIds
    @param modelName
    @public
  */
  keyForRelationshipIds(modelName) {
    return `${singularize(camelize(modelName))}Ids`;
  }

  /**
    This method is used by the POST and PUT shorthands. These shorthands
    expect a valid JSON:API document as part of the request, so that
    they know how to create or update the appropriate resouce. The normalize
    method allows you to transform your request body into a JSON:API
    document, which lets you take advantage of the shorthands when you
    otherwise may not be able to.

    Note that this method is a noop if you’re using JSON:API already,
    since request payloads sent along with POST and PUT requests will
    already be in the correct format.
    @method normalize
    @param json
    @public
  */
  normalize(json) {
    return json;
  }

  /*
    Private methods
  */

  /**
    @method _attrsForModel
    @param model
    @private
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

  /**
    @method _formatAttributeKeys
    @param attrs
    @private
  */
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