class Association {

  constructor(modelName) {
    this.modelName = modelName;

    // The modelName that owns this association
    this.owner = '';

    // The modelName this association refers to
    this.target = '';
  }

}

export default Association;
