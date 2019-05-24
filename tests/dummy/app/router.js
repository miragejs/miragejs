import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  docsRoute(this, function() {
    this.route('getting-started', function() {
      this.route('what-is-mirage');
      this.route('installation');
      this.route('upgrade-guide');
      this.route('overview');
    });

    this.route('route-handlers', function() {
      this.route('functions');
      this.route('shorthands');
    });

    this.route('data-layer', function() {
      this.route('database');
      this.route('orm');
      this.route('factories');
      this.route('fixtures');
      this.route('serializers');
    });

    this.route('testing', function() {
      this.route('acceptance-tests');
      this.route('integration-and-unit-tests');
      this.route('assertions');
    });

    this.route('advanced', function() {
      this.route('environment-options');
      this.route('simulating-cookie-responses');
      this.route('mocking-guids');
      this.route('customizing-the-inflector');
    });

    this.route('api', function() {
      this.route('class', { path: '/:class_id' });
    });
  });

  this.route('blog', function() {
    this.route('detail', { path: '/:post_slug_and_id' });
  });

  this.route('not-found', { path: '/*path' });
});

export default Router;
