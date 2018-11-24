import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    return params.post_slug;
  }

});
