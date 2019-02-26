function isNumber(n) {
  return (+n).toString() === n.toString();
}

/**
 * IdentityManager for a DbCollection
 *
 * @class IdentityManager
 * @constructor
 * @public
 * @hide
 */
class IdentityManager {

  constructor() {
    this._nextId = 1;
    this._ids = {};
  }

  /**
   * @method get
   * @private
   */
  get() {
    return this._nextId;
  }

  /**
   * @method set
   * @param {String|Number} n
   * @public
   */
  set(n) {
    if (this._ids[n]) {
      throw new Error(`Attempting to use the ID ${n}, but it's already been used`);
    }

    if (isNumber(n) && +n >= this._nextId) {
      this._nextId = +n + 1;
    }

    this._ids[n] = true;
  }

  /**
   * @method inc
   * @private
   */
  inc() {
    let nextValue = this.get() + 1;

    this._nextId = nextValue;

    return nextValue;
  }

  /**
   * @method fetch
   * @return {String} Unique identifier
   * @public
   */
  fetch() {
    let id = this.get();

    this._ids[id] = true;

    this.inc();

    return id.toString();
  }

  /**
   * @method reset
   * @public
   */
  reset() {
    this._nextId = 1;
    this._ids = {};
  }
}

export default IdentityManager;
