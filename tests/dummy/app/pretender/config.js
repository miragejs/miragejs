export default function() {
  // var store = this.store;

  // this.stub('get', 'products', ['products', 'categories']);

  // this.stub('get', '/contacts', function() {
  //   return ['contacts'];
  // });
  // this.stub('get', '/contacts', 'contacts');
  this.stub('get', '/contacts');
  // this.stub('get', '/contacts/:id', 'contact');

  // this.stub('get', '/contacts', function(store, request) {
  //   var contacts = store.find('contacts');

  //   return {
  //     contacts: contacts
  //   };
  // });

  // this.stub('get', '/contacts/:id', function(store, request) {//   var contact = store.find('contacts', request.params.id);
  //   var contactId = +request.params.id;

  //   var contact = store.find('contacts', contactId);
  //   var addresses = store.find('addresses')
  //     .filterBy('contact_id', +contactId);

  //   return {
  //     contact: contact,
  //     addresses: addresses
  //   };
  // });
  this.stub('get', '/contacts/:id');
  // this.stub('get', '/contacts/:id', ['contact', 'addresses']);

  // this.stub('get', '/contacts/:id', function() {
  //   return ['contacts'];
  // });

  // this.stub('get', 'products', {
  //   products: store.find('product'),
  //   cateogires: store.find('category')
  // });

  // this.stub('get', 'products', function(request) {

  //   var response = {
  //     data: {
  //       products: server.data.products
  //     },
  //     code: 200
  //   };

  //   return response;
  // });

  // this.stub('get', 'users', function(request) {

  //   var response = {
  //     data: {
  //       products: server.data.products
  //     },
  //     code: 200
  //   };

  //   return response;
  // });

};
