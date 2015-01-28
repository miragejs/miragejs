export default function() {
  // var store = this.store;

  // this.stub('get', 'products', ['products', 'categories']);

  // this.stub('get', '/contacts', function() {
  //   return ['contacts'];
  // });
  this.stub('get', '/contacts', 'contacts');
  this.stub('get', '/contacts/:id', 'contact');

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
