export default function() {

  var data = [1, 2, 3];

  // this.stub('get', 'blah', data);

  this.stub('get', 'blah', function(request) {
    var data = [1, 2, 2];

    return {data: data, code: 200}
  });

};
