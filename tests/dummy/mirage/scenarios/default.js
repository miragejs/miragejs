export default function(server) {
  let joe = server.create('contact', { name: 'Joe' });
  server.create('address', { name: '123 Hyrule Way', contact_id: joe.id });

  let bob = server.create('contact', { name: 'Bob' });
  server.create('address', { name: 'Mount Doom', contact_id: bob.id });
  server.create('contact', { name: 'Susan' });

  server.create('friend', { name: 'Joe', age: 10, isYoung: true });
  server.create('friend', { name: 'Bob', age: 80, isYoung: false });

  server.create('pet', { name: 'Pinky', alive: true });
  server.create('pet', { name: 'Bobby', alive: true });
  server.create('pet', { name: 'Brownie', alive: true });

  server.create('pet', { name: 'Cactus', alive: false });
}
