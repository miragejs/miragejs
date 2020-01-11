// TypeScript Version: 3.5

/*
 * Created by Dan Freeman
 * https://github.com/dfreeman/
 *
 * Source: https://gist.github.com/dfreeman/33fc80164c0ad91d5e9480a94aa6454c#file-tests-model-ts
 */
declare module "miragejs" {
  import {
    FactoryDefinition,
    ModelDefinition,
    ModelInstance
  } from "miragejs/-types";
  export { Server } from "miragejs/server";
  export { Registry, ModelInstance } from "miragejs/-types";

  /**
   * A fake HTTP request
   */
  export class Request {
    /** The request body, if defined */
    readonly requestBody: string | File;

    /** The URL of the request */
    readonly url: string;

    /** Any headers associated with the request, with downcased names */
    readonly requestHeaders: Record<string, string>;

    /** Any parameter specified via dynamic route segments */
    readonly params: Record<string, string>;

    /** Any query parameters associated with the request */
    readonly queryParams: Record<string, string>;
  }

  /**
   * A fake HTTP response. May be returned from a Mirage route
   * handler for finer-grained control over the response behavior.
   */
  export class Response {
    /**
     * @param code The HTTP status code for this response
     * @param headers Any custom headers to set in this response
     * @param body Data to send in the response body
     */
    constructor(code: number, headers: Record<string, string>, body: string);

    toRackResponse(): [number, Record<string, string>, string];
  }

  /**
   * The base definition for Mirage models.
   *
   * Use `Model.extend({ ... })` to define a model's relationships
   * (via `belongsTo()` and `hasMany()`) and any static default
   * attribute values.
   */
  export const Model: ModelDefinition;

  /**
   * The base definition for Mirage factories.
   *
   * Use `Factory.extend({ ... })` to define methods that
   * will generate default attribute values when `server.create`
   * or the corresponding `schema` method is called for this
   * type.
   */
  export const Factory: FactoryDefinition;

  /**
   * A collection of zero or more Mirage model instances.
   */
  export class Collection<T> {
    length: number;
    modelName: string;
    models: T[];
  }

  export interface RelationshipOptions {
    inverse?: string | null;
    polymorphic?: boolean;
  }

  /** The registry-aware type of Mirage's `belongsTo` function */
  // prettier-ignore
  export type BelongsTo<Registry> =
      & (<K extends keyof Registry>(key?: K, options?: RelationshipOptions) => () => Registry[K] | undefined)
      & (<K extends keyof Registry>(options: RelationshipOptions & { polymorphic: true }) => () => Registry[K] | undefined);

  /** Declares a one-to-one relationship to another Mirage model type. */
  export function belongsTo<T = ModelInstance>(
    key?: string,
    options?: RelationshipOptions
  ): () => T | undefined;
  export function belongsTo<T = ModelInstance>(
    options?: RelationshipOptions
  ): () => T | undefined;

  /** The registry-aware type of Mirage's `hasMany` function */
  // prettier-ignore
  export type HasMany<Registry> =
      & (<K extends keyof Registry>(key?: K, options?: RelationshipOptions) => () => Collection<Registry[K]>)
      & (<K extends keyof Registry>(options: RelationshipOptions & { polymorphic: true }) => () => Collection<Registry[K]>);

  /** Declares a one-to-many relationship to another Mirage model type. */
  export function hasMany<T = ModelInstance>(
    key?: string,
    options?: RelationshipOptions
  ): () => Collection<T>;
  export function hasMany<T = ModelInstance>(
    options?: RelationshipOptions
  ): () => Collection<T>;
}

declare module "miragejs/-types" {
  import { Collection } from "miragejs";

  // Captures the result of a `Model.extend()` call
  const ModelData: unique symbol;
  interface ModelDefinition<Data = {}> {
    [ModelData]: Data;
    extend<NewData>(data: NewData): ModelDefinition<Assign<Data, NewData>>;
  }

  // Captures the result of a `Factory.extend()` call
  const FactoryData: unique symbol;
  interface FactoryDefinition<Data = {}> {
    [FactoryData]: Data;
    extend<NewData>(data: NewData): FactoryDefinition<Assign<Data, NewData>>;
  }

  // The type-level equivalent of `Object.assign`
  type Assign<T, U> = U & Omit<T, keyof U>;

  // Extract relationship values from a model definiton
  type FlattenRelationships<T> = {
    [K in keyof T]: T[K] extends (() => infer Value) ? Value : T[K];
  };

  // Extract factory method return values from a factory definition
  type FlattenFactoryMethods<T> = {
    [K in keyof T]: T[K] extends (n: number) => infer V ? V : T[K];
  };

  // Extracts model definition info for the given key, if a correesponding model is defined
  type ExtractModelData<Models, K> = K extends keyof Models
    ? Models[K] extends ModelDefinition<infer Data>
      ? FlattenRelationships<Data>
      : {}
    : {};

  // Extracts factory definition info for the given key, if a correesponding factory is defined
  type ExtractFactoryData<Factories, K> = K extends keyof Factories
    ? Factories[K] extends FactoryDefinition<infer Data>
      ? FlattenFactoryMethods<Data>
      : {}
    : {};

  /**
   * Models all available information about a given set of model and
   * factory definitions, determining the behavior of ORM methods on
   * a `Server` and its corresponding `Schema` instance.
   */
  export type Registry<
    Models extends Record<string, ModelDefinition>,
    Factories extends Record<string, FactoryDefinition>
  > = {
    [K in keyof Models | keyof Factories]: ModelInstance<
      ExtractModelData<Models, K> & ExtractFactoryData<Factories, K>
    >;
  };

  /** Represents the type of an instantiated Mirage model.  */
  export type ModelInstance<Data = {}> = Data & {
    id?: string;
    attrs: Record<string, unknown>;
    modelName: string;

    /** Persists any updates on this model back to the Mirage database. */
    save(): void;

    /** Updates and immediately persists a single attr on this model. */
    update<K extends keyof Data>(key: K, value: Data[K]): void;

    /** Removes this model from the Mirage database. */
    destroy(): void;

    /** Reloads this model's data from the Mirage database. */
    reload(): void;
  };
}

declare module "miragejs/server" {
  import { Request, Response } from "miragejs";
  import { ModelInstance } from "miragejs/-types";
  import Db from "miragejs/db";
  import Schema from "miragejs/orm/schema";

  type MaybePromise<T> = T | PromiseLike<T>;

  /** A callback that will be invoked when a given Mirage route is hit. */
  export type RouteHandler<Registry> = (
    schema: Schema<Registry>,
    request: Request
  ) => MaybePromise<ModelInstance | Response | object>;

  export interface HandlerOptions {
    /** A number of ms to artifically delay responses to this route. */
    timing?: number;
  }

  export class Server<Registry = Record<string, ModelInstance>> {
    /** The underlying in-memory database instance for this server. */
    readonly db: Db;

    /** An interface to the Mirage ORM that allows for querying and creating records. */
    readonly schema: Schema<Registry>;

    /** Creates a model of the given type. */
    readonly create: Schema<Registry>["create"];

    /** Whether or not Mirage should log all requests/response cycles. */
    logging: boolean;

    /** A default number of ms to artifically delay responses for all routes. */
    timing: number;

    /** A default prefix applied to all subsequent route definitions. */
    namespace: string;

    /** Creates multiple models of the given type. */
    createList<
      K extends keyof Registry,
      Init extends Registry[K],
      Data extends Partial<Init>
    >(modelName: K, count: number, data?: Data): Array<Init & Data>;

    /** Handle a GET request to the given path. */
    get(
      path: string,
      handler?: RouteHandler<Registry>,
      options?: HandlerOptions
    ): void;

    /** Handle a POST request to the given path. */
    post(
      path: string,
      handler?: RouteHandler<Registry>,
      options?: HandlerOptions
    ): void;

    /** Handle a PUT request to the given path. */
    put(
      path: string,
      handler?: RouteHandler<Registry>,
      options?: HandlerOptions
    ): void;

    /** Handle a PATCH request to the given path. */
    patch(
      path: string,
      handler?: RouteHandler<Registry>,
      options?: HandlerOptions
    ): void;

    /** Handle a DELETE request to the given path. */
    del(
      path: string,
      handler?: RouteHandler<Registry>,
      options?: HandlerOptions
    ): void;

    /** Pass through one or more URLs to make real requests. */
    passthrough(...urls: string[]): void;

    /** Load all available fixture data matching the given name(s). */
    loadFixtures(...names: string[]): void;
  }
}

declare module "miragejs/db" {
  /** The in-memory database containing all currently active data keyed by collection name. */
  export default class Db {
    [key: string]: unknown;
  }
}

declare module "miragejs/orm/schema" {
  import { Collection, ModelInstance } from "miragejs";
  import Db from "miragejs/db";

  type ModelInitializer<Data> = {
    [K in keyof Data]: Data[K] extends Collection<infer M>
      ? Collection<M> | M[]
      : Data[K];
  };

  /**
   * An interface to the Mirage ORM that allows for querying and creating records.
   */
  export default class Schema<Registry = Record<string, ModelInstance>> {
    /** Mirage's in-memory database */
    readonly db: Db;

    /**
     * Creates a model of the given type.
     * @param modelName The type of model to instantiate
     * @param data Optional initial values for model attributes/relationships
     */
    create<
      K extends keyof Registry,
      Init extends Registry[K],
      Data extends Partial<ModelInitializer<Init>>
    >(
      modelName: K,
      data?: Data
    ): Init & { [K in keyof Init & keyof Data]: Exclude<Init[K], undefined> };

    /** Locates one or more existing models of the given type by ID(s). */
    find<K extends keyof Registry>(type: K, id: string): Registry[K] | null;
    find<K extends keyof Registry>(
      type: K,
      ids: string[]
    ): Collection<Registry[K]>;

    /** Locates an existing model of the given type by attribute value(s), if one exists. */
    findBy<K extends keyof Registry>(
      type: K,
      attributes: Partial<Registry[K]>
    ): Registry[K] | null;

    /** Locates an existing model of the given type by attribute value(s), creating one if it doesn't exist. */
    findOrCreateBy<K extends keyof Registry>(
      type: K,
      attributes: Partial<Registry[K]>
    ): Registry[K];

    /** Locates an existing model of the given type by attribute value(s), if one exists. */
    where<K extends keyof Registry>(
      type: K,
      attributes: Partial<Registry[K]>
    ): Collection<Registry[K]>;
    where<K extends keyof Registry>(
      type: K,
      // tslint:disable-next-line:unified-signatures
      test: (item: Registry[K]) => unknown
    ): Collection<Registry[K]>;

    /** Returns a collection of all known records of the given type */
    all<K extends keyof Registry>(type: K): Collection<Registry[K]>;

    /** Returns an empty collection of the given type */
    none<K extends keyof Registry>(type: K): Collection<Registry[K]>;

    /** Returns the first model instance found of the given type */
    first<K extends keyof Registry>(type: K): Registry[K] | null;
  }
}

declare module "miragejs/test-support/setup-mirage" {
  /** Enables Mirage in the current test scope. */
  export default function setupMirage(hooks: {
    beforeEach: () => void;
    afterEach: () => void;
  }): void;
}
