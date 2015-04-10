import Ember from 'ember';
import GetController from 'ember-cli-mirage/controllers/get';
import PostController from 'ember-cli-mirage/controllers/post';
import PutController from 'ember-cli-mirage/controllers/put';
import DeleteController from 'ember-cli-mirage/controllers/delete';

var defaultCodes = {
  put: 204,
  post: 201,
  delete: 204
};

export default {

  getController: GetController.create(),
  postController: PostController.create(),
  putController: PutController.create(),
  deleteController: DeleteController.create(),

  handle: function(verb, handler, db, request, code) {
    var controller = verb + 'Controller';
    code = code ? code : (defaultCodes[verb] || 200);

    var type = typeof handler;
    var handlerType = Ember.isArray(handler) ? 'array' : type;

    var handlerMethod = handlerType + 'Handler';

    var handlerExists = this[controller][handlerMethod];
    if (!handlerExists) { console.error('Mirage: You passed a ' + handlerType + ' as a handler to the ' + controller + ' but no ' + handlerMethod + ' was implemented.'); return;}

    var data = this[controller][handlerMethod](handler, db, request, code);

    if (data) {
      return [code, {"Content-Type": "application/json"}, data];
    } else {
      return [code, {}, undefined];
    }
  }
};
