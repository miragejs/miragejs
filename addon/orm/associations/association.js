export default class Association {

  constructor(modelName) {
    // The modelName of the association
    this.modelName = modelName;

    // The key pointing to the association
    this.key = '';

    // The modelName that owns this association
    this.ownerModelName = '';
  }

}
