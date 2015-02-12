export default function() {
  // contacts
  this.stub('get', '/contacts', 'contacts');
  this.stub('post', '/contacts');

  // contact
  this.stub('get', '/contacts/:id');
  this.stub('put', '/contacts/:id');
  this.stub('delete', '/contacts/:id');
}
