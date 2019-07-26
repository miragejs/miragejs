import { Model } from "ember-cli-mirage";
import Server from "ember-cli-mirage/server";
import ActiveModelSerializer from "ember-cli-mirage/serializers/active-model-serializer";
import RestSerializer from "ember-cli-mirage/serializers/rest-serializer";
import $ from "jquery";

describe("Integration | Server Config", () => {
  let server;
  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        contact: Model,
        post: Model
      },
      serializers: {
        contact: ActiveModelSerializer
      }
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(function() {
    server.shutdown();
  });

  test("namespace can be configured", () => {
    assert.expect(1);
    let done = assert.async();

    let contacts = [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }];
    server.db.loadData({
      contacts
    });
    server.namespace = "api";
    server.get("/contacts");

    $.getJSON("/api/contacts", function(data) {
      expect(data).toEqual({ contacts });
      done();
    });
  });

  test("urlPrefix can be configured", () => {
    assert.expect(1);
    let done = assert.async();
    let { server } = this;

    let contacts = [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }];
    server.db.loadData({
      contacts
    });
    server.urlPrefix = "http://localhost:3000";
    server.get("/contacts");

    $.getJSON("http://localhost:3000/contacts", function(data) {
      expect(data).toEqual({ contacts });
      done();
    });
  });

  test("urlPrefix and namespace can be configured simultaneously", () => {
    assert.expect(1);
    let done = assert.async();
    let { server } = this;

    let contacts = [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }];
    server.db.loadData({
      contacts
    });
    server.urlPrefix = "http://localhost:3000";
    server.namespace = "api";
    server.get("/contacts");

    $.getJSON("http://localhost:3000/api/contacts", function(data) {
      expect(data).toEqual({ contacts });
      done();
    });
  });

  test("fully qualified domain names can be used in configuration", () => {
    assert.expect(1);
    let done = assert.async();

    let contacts = [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }];
    server.db.loadData({
      contacts
    });
    server.get("http://example.org/api/contacts");

    $.getJSON("http://example.org/api/contacts", function(data) {
      expect(data).toEqual({ contacts });
      done();
    });
  });

  test("urlPrefix/namespace are ignored when fully qualified domain names are used in configuration", () => {
    assert.expect(1);
    let done = assert.async();
    let { server } = this;

    let contacts = [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }];
    server.db.loadData({
      contacts
    });
    this.urlPrefix = "https://example.net";
    server.get("http://example.org/api/contacts");

    $.getJSON("http://example.org/api/contacts", function(data) {
      expect(data).toEqual({ contacts });
      done();
    });
  });

  test("blank urlPrefix and namespace ends up as /", () => {
    assert.expect(1);
    let done = assert.async();

    let contacts = [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }];
    server.db.loadData({
      contacts
    });
    server.namespace = "";
    server.urlPrefix = "";
    server.get("contacts");

    $.getJSON("/contacts", function(data) {
      expect(data).toEqual({ contacts });
      done();
    });
  });

  test("namespace with no slash gets one", () => {
    assert.expect(1);
    let done = assert.async();

    let contacts = [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }];
    server.db.loadData({
      contacts
    });
    server.namespace = "api";
    server.get("contacts");

    $.getJSON("/api/contacts", function(data) {
      expect(data).toEqual({ contacts });
      done();
    });
  });

  test("urlPrefix with no slash gets one", () => {
    assert.expect(1);
    let done = assert.async();

    let contacts = [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }];
    server.db.loadData({
      contacts
    });
    server.urlPrefix = "pre";
    server.get("contacts");

    $.getJSON("/pre/contacts", function(data) {
      expect(data).toEqual({ contacts });
      done();
    });
  });

  test("namespace of / works", () => {
    assert.expect(1);
    let done = assert.async();

    let contacts = [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }];
    server.db.loadData({
      contacts
    });
    server.namespace = "/";
    server.get("contacts");

    $.getJSON("/contacts", function(data) {
      expect(data).toEqual({ contacts });
      done();
    });
  });

  test("redefining options using the config method works", () => {
    assert.expect(5);
    let done = assert.async();
    let { server } = this;

    let contacts = [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }];
    server.config({
      namespace: "api",
      urlPrefix: "http://localhost:3000",
      timing: 1000,
      serializers: {
        post: RestSerializer
      }
    });
    server.db.loadData({
      contacts
    });
    server.get("contacts");

    expect(server.timing).toEqual(1000);
    $.getJSON("http://localhost:3000/api/contacts", function(data) {
      expect(data).toEqual({ contacts });
      done();
    });
    let serializerMap = server.serializerOrRegistry._serializerMap;
    expect(Object.keys(serializerMap)).toHaveLength(2);
    expect(serializerMap.contact).toEqual(ActiveModelSerializer);
    expect(serializerMap.post).toEqual(RestSerializer);
  });

  test("changing the environment of the server throws an error", () => {
    let { server } = this;

    expect(function() {
      server.config({
        environment: "test"
      });
    }).toThrow();
  });

  test("changing the trackRequests configuration of the server throws an error", () => {
    let { server } = this;

    expect(function() {
      server.config({
        trackRequests: true
      });
    }).toThrow();
  });
});
