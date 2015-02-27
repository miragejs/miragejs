export default function() {
  // Contacts
  this.get('/contacts');
  this.get('/contacts/:id');
  this.post('/contacts');
  this.put('/contacts/:id');
  this.del('/contacts/:id');

  // Friends
  this.get('/friends');
}
