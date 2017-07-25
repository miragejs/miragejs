import { isBlank } from '@ember/utils';

import Mirage from 'ember-cli-mirage';

export default function() {
  this.namespace = '/api';

  // Contacts
  this.get('/contacts');
  // this.get('/contacts', ['contacts', 'addresses']);
  this.get('/contacts/:id');
  this.post('/contacts');
  this.put('/contacts/:id');
  this.del('/contacts/:id');

  // Friends
  this.get('/friends', { coalesce: true });

  // Pets
  this.get('/pets', function({ db }) {
    return { pets: db.pets.filter((pet) => pet.alive) };
  });

  this.post('/pets', function({ db }, req) {
    let { pet } = JSON.parse(req.requestBody);
    if (isBlank(pet.name)) {
      let body = { errors: { name: ["can't be blank"] } };
      return new Mirage.Response(422, { some: 'header' }, body);
    } else {
      return { pet: db.pets.insert(pet) };
    }
  });

  this.put('/pets/:id', function({ db }, req) {
    let { pet } = JSON.parse(req.requestBody);
    db.pets.update(pet.id, pet);
    return pet;
  });

  this.delete('/pets/:id', function() { }, 200);

  this.get('/word-smiths/:id');

}

export function testConfig() {
  this.get('/friends/:id');
}
