export default function() {
  // contacts
  this.get('/contacts');
  this.post('/contacts');

  // contact
  this.get('/contacts/:id');
  this.put('/contacts/:id');
  this.del('/contacts/:id');
}
