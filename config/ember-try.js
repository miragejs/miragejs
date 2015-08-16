module.exports = {
  scenarios: [
    {
      name: 'default',
      dependencies: { }
    },
    {
      name: 'ember-1.13.8',
      dependencies: {
        'ember': '1.13.8',
        'ember-data': '1.13.9'
      }
    },
    {
      name: 'ember-release',
      dependencies: {
        'ember': 'components/ember#release',
        'ember-data': 'v2.0.0-beta.2'
      },
      resolutions: {
        'ember': 'release'
      }
    },
    {
      name: 'ember-beta',
      dependencies: {
        'ember': 'components/ember#beta',
        'ember-data': 'v2.0.0-beta.2'
      },
      resolutions: {
        'ember': 'beta'
      }
    },
    {
      name: 'ember-canary',
      dependencies: {
        'ember': 'components/ember#canary',
        'ember-data': 'v2.0.0-beta.2'
      },
      resolutions: {
        'ember': 'canary'
      }
    }
  ]
};
