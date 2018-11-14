export default function() {
  this.passthrough();
}

export function testConfig() {
  this.get('/friends/:id');
}
