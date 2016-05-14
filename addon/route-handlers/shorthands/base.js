import _isArray from 'lodash/lang/isArray';
import { camelize, singularize, pluralize } from 'ember-cli-mirage/utils/inflector';
import BaseRouteHandler from '../base';

export default class BaseShorthandRouteHandler extends BaseRouteHandler {

  constructor(schema, serializerOrRegistry, shorthand, path, options={}) {
    super();
    shorthand = shorthand || this.getModelClassFromPath(path);
    this.schema = schema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.shorthand = shorthand;
    this.options = options;

    let type = _isArray(shorthand) ? 'array' : typeof shorthand;
    if (type === 'string') {
      let modelClass = this.schema[pluralize(camelize(singularize(shorthand)))];
      this.handle = (request) => {
        return this.handleStringShorthand(request, modelClass);
      };
    } else if (type === 'array') {
      let modelClasses = shorthand.map((modelName) => this.schema[pluralize(camelize(singularize(modelName)))]);
      this.handle = (request) => {
        return this.handleArrayShorthand(request, modelClasses);
      };
    }
  }

  handleStringShorthand() { }
  handleArrayShorthand() { }

}
