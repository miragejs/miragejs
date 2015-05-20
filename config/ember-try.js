module.exports = {
  scenarios: [
    {
      name: 'ember-1.11.1',
      dependencies: {
        'ember': '1.11.1',
      }
    },
    {
      name: 'ember-1.12.0',
      dependencies: {
        'ember': '1.12.0'
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
