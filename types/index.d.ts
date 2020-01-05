import { RequestHandler, Server as PretenderServer } from "pretender";

declare interface IServerOptions {
  environment?: string;
  routes?: (this: Server) => any;
  baseConfig?: (this: Server) => any;
  testConfig?: (this: Server) => any;
  seeds?: (server: Server) => any;
}

declare class Server {
  public db: Db;
  public inflector: any;
  public logging: boolean;
  public namespace: string;
  public pretender: PretenderServer;
  public schema: Schema;
  public timing: number;
  public urlPrefix: string;

  constructor(serverOptions: IServerOptions);

  public testConfig(): any;
  public baseConfig(): any;

  public create(type: any, traitsAndOverrides?: any): any;
  public createList(type: any, amount: any, traitsAndOverrides?: any): any;
  public loadFixtures(...args: string[]): any;
  public passthrough(...paths: string[]): void;
  public passthrough(fn: (request: any) => any): void;
  public shutdown(): any;

  public get(
    path: string,
    model: string | ((schema: Schema, request?: any) => any)
  ): void;
  public post(
    path: string,
    model: string | ((schema: Schema, request?: any) => any)
  ): void;
  public put(
    path: string,
    model: string | ((schema: Schema, request?: any) => any)
  ): void;
  public del(path: string): void;
}

declare class Schema {
  public db: Db;

  public all(type: any): any;
  public create(type: any, attrs: any): any;
  public find(type: any, ids: any[]): any;
  public findBy(type: any, attributeName?: any): any;
  public findOrCreateBy(type: any, attributeName?: any): any;
  public first(type: any): any;
  public new(type: any, attrs?: any): any;
  public none(type: any): any;
  public where(type: any, query?: any): any;
}

declare class Db {
  [key: string]: any | DbCollection;

  public createCollection(name: any, initialData?: any): any;
  public dump(): any;
  public emptyData(): any;
  public loadData<T>(data: { [key: string]: T[] }): any;
}

declare class DbCollection {
  [key: string]: any;

  public find(ids: any): any;
  public findBy(): any;
  public firstOrCreate(): any;
  public insert(record: any): any;
  public remove(): any;
  public update(): any;
  public where(): any;
}

export { Server, IServerOptions };
