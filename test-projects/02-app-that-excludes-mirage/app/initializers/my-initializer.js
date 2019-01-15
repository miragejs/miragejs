export function initialize(application) {
  application.inject('controller', 'wifi', 'service:wifi');
}

export default {
  initialize,
  before: 'ember-cli-mirage'
};
