import Ember from 'ember';
import GetController from 'ember-pretenderify/controllers/get';
import PostController from 'ember-pretenderify/controllers/post';
import PutController from 'ember-pretenderify/controllers/put';
import DeleteController from 'ember-pretenderify/controllers/delete';

export default {

  getController: GetController.create(),
  postController: PostController.create(),
  putController: PutController.create(),
  deleteController: DeleteController.create(),

  handle: function(verb, handler, store, request, code) {
    var controller = verb + 'Controller';
    var handlerType;

    if (typeof handler === 'function') { handlerType = 'function'; }
    else if (Ember.isArray(handler)) { handlerType = 'array'; }
    else if (typeof handler === 'string') { handlerType = 'string'; }
    else if (typeof handler === 'undefined') { handlerType = 'undefined'; }

    var handlerMethod = handlerType + 'Handler';

    var handlerExists = this[controller][handlerMethod];
    if (!handlerExists) { console.error('Pretenderify: You passed a ' + handlerType + ' as a handler to the ' + controller + ' but no ' + handlerMethod + ' was implemented.'); return;}

    var data = this[controller][handlerMethod](handler, store, request, code);

    if (data) {
      return [code, {"Content-Type": "application/json"}, data];
    } else {
      return [code, {}, undefined];
    }
  }

};
