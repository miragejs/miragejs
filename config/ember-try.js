module.exports = {
  scenarios: [
    {
      name: 'ember-1.11.1',
      dependencies: {
        'ember': '1.11.1',
      }
    },
    {
      name: 'ember-1.12.0-beta.1',
      dependencies: {
        'ember': '1.12.0-beta.1'
      }
    },
    {
      name: 'ember-beta',
      dependencies: {
        'ember': 'components/ember#beta',
      },
      resolutions: {
        'ember': 'beta'
      }
    }
  ]
};
