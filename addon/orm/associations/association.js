class Association {

  constructor(type) {
    this.type = type;

    // The model type that owns this association
    this.owner = '';

    // The model type this association refers to
    this.target = '';
  }

}

export default Association;
