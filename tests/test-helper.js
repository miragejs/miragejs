import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';

import Ember from 'ember';

if (Ember.VERSION === "1.13.13") {
  setResolver(resolver);
} else {
  setApplication(Application.create(config.APP));
}

start();
