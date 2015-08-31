import Serializer from '../serializer';
import { decamelize } from '../utils/inflector';

export default Serializer.extend({

  keyForAttribute(key) {
    return decamelize(key);
  }

});
