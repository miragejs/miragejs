export default function() {
  this.model('contact');
  this.model('address', { belongsTo: 'contacts' });
}
