import BaseShorthandRouteHandler from './base';
import Response from 'ember-cli-mirage/response';
import { singularize, pluralize } from 'ember-cli-mirage/utils/inflector';
import Db from 'ember-cli-mirage/db';

export default class GetShorthandRouteHandler extends BaseShorthandRouteHandler {

  /*
    Retrieve *key* from the db. If it's singular,
    retrieve a single model by id.

    Examples:
      this.stub('get', '/contacts', 'contacts');
      this.stub('get', '/contacts/:id', 'contact');
  */
  handleStringShorthand(string, dbOrSchema, request, options = {}) {
    let id = this._getIdForRequest(request);

    if (dbOrSchema instanceof Db) {
      let db = dbOrSchema;
      let key = string;
      let collection = pluralize(string);
      let data = {};
      let record;

      if (!db[collection]) {
        console.error("Mirage: The route handler for " + request.url + " is requesting data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
      }

      if (id) {
        record = db[collection].find(id);
        if (!record) {
          return new Response(404, {}, {});
        }
        data[key] = record;
      } else if (options.coalesce && request.queryParams && request.queryParams.ids) {
        data[key] = db[collection].find(request.queryParams.ids);
      } else {
        data[key] = db[collection];
      }
      return data;

    } else {
      let schema = dbOrSchema;
      let type = singularize(string);

      if (id) {
        return schema[type].find(id);
      } else if (options.coalesce && request.queryParams && request.queryParams.ids) {
        return schema[type].find(request.queryParams.ids);
      } else {
        return schema[type].all();
      }
    }
  }

  /*
    Retrieve *keys* from the db.

    If all keys plural, retrieve all objects from db.
      Ex: this.stub('get', '/contacts', ['contacts', 'pictures']);


    If first is singular, find first by id, and filter all
    subsequent models by related.
      Ex: this.stub('get', '/contacts/:id', ['contact', 'addresses']);
  */
  handleArrayShorthand(array, dbOrSchema, request) {
    var keys = array;
    var owner;
    var ownerKey;

    if (dbOrSchema instanceof Db) {
      let data = {};
      let db = dbOrSchema;

      keys.forEach(key => {
        var collection = pluralize(key);

        if (!db[collection]) {
          console.error("Mirage: The route handler for " + request.url + " is requesting data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
        }

        // There's an owner. Find only related.
        if (ownerKey) {
          var ownerIdKey = singularize(ownerKey) + '_id';
          var query = {};
          query[ownerIdKey] = owner.id;
          data[key] = db[collection].where(query);

        } else {

          // TODO: This is a crass way of checking if we're looking for a single model, doens't work for e.g. sheep
          if (singularize(key) === key) {
            ownerKey = key;
            var id = this._getIdForRequest(request);
            var model = db[collection].find(id);
            data[key] = model;
            owner = model;

          } else {
            data[key] = db[collection];
          }
        }
      });

      return data;

    } else {
      let schema = dbOrSchema;
      let id = this._getIdForRequest(request);

      /*
      If the first key is singular and we have an id param in
      the request, we're dealing with the version of the shorthand
      that has a parent model and several has-many relationships.
      We throw an error, because the serializer is the appropriate
      place for this now.
      */
      if (id && singularize(keys[0]) === keys[0]) {
        throw `Mirage: It looks like you're using the "Single record with
        related records" version of the array shorthand, in addition to opting
        in to the model layer. This shorthand was made when there was no
        serializer layer. Now that you're using models, please ensure your
        relationships are defined, and create a serializer for the parent
        model, adding the relationships there.`;

      } else {
        return keys.map(type => schema[singularize(type)].all());
      }
    }
  }

  /*
    Retrieve objects from the db based on singular version
    of the last portion of the url.

    This would return all contacts:
      Ex: this.stub('get', '/contacts');

    If an id is present, return a single model by id.
      Ex: this.stub('get', '/contacts/:id');

    If the options contain a `coalesce: true` option and the queryParams have `ids`, it
    returns the models with those ids.
      Ex: this.stub('get', '/contacts/:id');
  */
  handleUndefinedShorthand(undef, dbOrSchema, request, options) {
    var id = this._getIdForRequest(request);
    var url = this._getUrlForRequest(request);
    var type = this._getTypeFromUrl(url, id);
    var str = id ? type : pluralize(type);

    return this.handleStringShorthand(str, dbOrSchema, request, options);
  }


}
