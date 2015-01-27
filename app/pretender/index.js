/* global jQuery  */
import Pretender from 'pretender';

// import hostApp from './data/hostApp';
// import apps from './data/apps';
// import builds from './data/builds';

// var stubData = {
//   hostApp: hostApp,
//   apps: apps,
//   builds: builds,
// };

// // by default allow logging in
// stubData.validLogin = true;

// stubData.currentUser = {
//   email: "sam.selikoff@gmail.com",
//   firstname: "Sam",
//   id: "current",
//   lastname: "Selikoff"
// };

var config = function() {
};
//   this.prepareBody = function(body){
//     return body ? JSON.stringify(body) : '{"error": "not found"}';
//   };

//   this.stubUrl = function(verb, url, data) {
//     this[verb].call(this, '/api' + url, function() {
//       console.log('Hitting ' + url);
//       console.log(data);
//       return [200, {}, data];
//     });
//   }.bind(this);

//   this.unhandledRequest = function(verb, path) {
//     console.error("FAILED REQUEST");
//     console.error(verb, path);
//   };

//   this.setupGlobalRoutes = function(data) {
//     var _this = this;

//     this.stubUrl('get', '/host_apps/current', {
//       host_app: data.hostApp
//     });

//     this.stubUrl('get', '/apps', {
//       apps: data.apps,
//       builds: data.builds
//     });

//     this.stubUrl('post', '/apps', {});
//     this.get('/api/apps/:id', function(request) {
//       var id = +request.params.id;
//       var app = data.apps.findBy('id', id);
//       var builds = data.builds.filterBy('app_id', id);

//       var response = {
//         app: app,
//         builds: builds
//       };

//       console.log('Hitting /api/apps/:id');
//       console.log(response);
//       return [200, {}, response];
//     });
//     this.put('/api/apps/:id', function(request) {
//       var id = +request.params.id;
//       var oldApp = data.apps.findBy('id', id);
//       var index = data.apps.indexOf(oldApp);

//       var newApp = JSON.parse(request.requestBody);
//       newApp.app.id = id;
//       data.apps[index] = newApp.app;

//       console.log('PUT /api/apps/:id');
//       console.log(newApp);
//       return [200, {}, newApp];
//     });
//     this.delete('/api/apps/:id', function(request) {
//       var appId = +request.params.id;
//       data.apps = data.apps.rejectBy('id', appId);
//       data.builds = data.builds.rejectBy('app_id', appId);

//       _this.setupGlobalRoutes.call(_this, data);

//       return [204, {}];
//     });

//     this.put('/api/builds/:id', function(request) {
//       var id = +request.params.id;
//       var oldBuild = data.builds.findBy('id', id);
//       var index = data.builds.indexOf(oldBuild);

//       var newBuild = JSON.parse(request.requestBody);
//       newBuild.build.id = id;
//       data.builds[index] = newBuild.build;

//       console.log('PUT /api/builds/:id');
//       console.log(newBuild);
//       return [200, {}, newBuild];
//     });

//   }.bind(this);

//   this.resetGlobalRoutes = function() {
//     var data = jQuery.extend(true, {}, stubData); // Make sure we have a copy

//     this.setupGlobalRoutes(data);
//   };

//   this.resetGlobalRoutes();
// };

export default {
  initialize: function() {
    return new Pretender(config);
  }
};
