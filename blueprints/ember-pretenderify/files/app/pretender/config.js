export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Default config
  */
  // this.namespace = 'api';
  // this.timing = 400;


  /*
    Routes
  */
  /*
    GET shorthands

    // Collections
    this.stub('get', '/contacts')
    this.stub('get', '/contacts', 'users')
    this.stub('get', '/contacts', ['contacts', 'addresses'])

    // Single objects
    this.stub('get', '/contacts/:id')
    this.stub('get', '/contacts/:id', 'user')
    this.stub('get', '/contacts/:id', ['contact', 'addresses'])
  */

  /*
    POST shorthands

    this.stub('post', '/contacts');
    this.stub('post', '/contacts', 'user'); // specify the type of resource to be created
  */

  /*
    PUT shorthands

    this.stub('put', '/contacts/:id');
    this.stub('put', '/contacts/:id', 'user'); // specify the type of resource to be updated
  */

  /*
    DELETE shorthands

    this.stub('delete', '/contacts/:id')
    this.stub('delete', '/contacts/:id', 'user') // specify the type of resource to be deleted

    // Single object + related resources. Make sure parent resource is first.
    this.stub('delete', '/contacts/:id', ['contact', 'addresses']);
  */

  /*
    Function fallback. Manipulate data in the store via

      - store.find(key)
      - store.find(key, id)-
      - store.push(key, data)
      - store.delete(key, id)

    // Example: return a single object with related models
    this.stub('get', '/contacts/:id', function(store, request) {
      var contactId = +request.params.id;
      var contact = store.find('contact', contactId);
      var addresses = store.find('address')
        .filterBy('contact_id', contactId);

      return {
        contact: contact,
        addresses: addresses
      };
    });

  */
}
