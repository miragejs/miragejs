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
  public logging: boolean;
  public namespace: string;
  public pretender: PretenderServer;
  public schema: any;
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

  public get(path: string, model: string | (() => any)): void;
  public post(path: string, model: string | (() => any)): void;
  public put(path: string, model: string | (() => any)): void;
  public del(path: string): void;
}

export { Server, IServerOptions };
