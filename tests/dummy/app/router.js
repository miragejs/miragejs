import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  docsRoute(this, function() {
    this.route('getting-started', { path: '/' }, function() {
      this.route('overview');
      this.route('installation');
      this.route('quickstart');
      this.route('upgrading');
    });

    this.route('writing-your-server', function() {
      this.route('defining-routes');
      this.route('seeding-your-database');
      this.route('acceptance-testing');
    });

    this.route('cookbook', function() {
      this.route('manually-starting-mirage');
      this.route('simulating-cookie-responses');
    });

    this.route('advanced', function() {
      this.route('environment-options');
    });

    this.route('examples', function() {
      this.route('1-belongs-to');
      this.route('2-has-many');
    });

    this.route('api', function() {
      this.route('class', { path: '/:class_id' });
    });
  });

  // this.route('contacts', { path: '/' });
  // this.route('contact', { path: '/:contact_id' });
  // this.route('edit', { path: '/:contact_id/edit' });
  //
  // this.route('friends');
  // this.route('friend', { path: '/friends/:friend_id' });
  // this.route('close-friends');
  // this.route('pets');
  //
  // this.route('word-smith', { path: '/word-smiths/:word_smith_id' });

  this.route('not-found', { path: '/*path' });
});

export default Router;
