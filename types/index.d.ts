import { Server as PretenderServer } from "pretender";

declare interface IServerOptions {
  environment?: string;
  routes?: (this: Server) => any;
  baseConfig?: (this: Server) => any;
  testConfig?: (this: Server) => any;
}

declare class Server {
  public db: any;
  public inflector: any;
  public logging: any;
  public namespace: any;
  public pretender: PretenderServer;
  public schema: any;
  public timing: any;
  public urlPrefix: any;

  constructor(serverOptions: IServerOptions);

  public testConfig(): any;
  public baseConfig(): any;

  public create(type: any, traitsAndOverrides?: any): any;
  public createList(type: any, amount: any, traitsAndOverrides?: any): any;
  public loadFixtures(...args: string[]): any;
  public passthrough(...paths: string[]): any;
  public passthrough(fn: (request: any) => any): any;
  public shutdown(): any;

  public get(path: string, model: string | (() => any)): any;
  public post(path: string, model: string | (() => any)): any;
  public put(path: string, model: string | (() => any)): any;
  public del(path: string): any;
}

export { Server, IServerOptions };
