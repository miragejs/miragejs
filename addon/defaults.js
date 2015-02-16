import frontController from 'ember-pretenderify/controllers/front';

export default function(environment) {
  var _this = this;

  this.stub = function(verb, path, handler, code) {
    var timing = environment === 'test' ? 0 : _this.timing;
    var namespace = _this.namespace || '';
    path = path[0] === '/' ? path.slice(1) : path;

    _this[verb].call(_this, namespace + '/' + path, function(request) {

      var response = frontController.handle(verb, handler, _this.store, request, code);

      if (environment !== 'test') {
        console.log('Successful request: ' + verb.toUpperCase() + ' ' + request.url);
        console.log(response[2]);
      }

      return response;
    }, timing);

  };
}
