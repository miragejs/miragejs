export default function() {
  var server = this;

  this.stub('get', 'products', {
    products: server.data.products
  });
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
