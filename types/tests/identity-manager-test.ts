import {expectType, expectError} from 'tsd';
import { createServer, IdentityManager, Model } from "miragejs";

const identityManager = new IdentityManager();

expectType<number|undefined>(identityManager.get?.());
expectType<void>(identityManager.set("id"));
expectType<number|undefined>(identityManager.inc?.());
expectType<string>(identityManager.fetch());
expectType<void>(identityManager.reset());

createServer({
  identityManagers: {
    application: IdentityManager,
  },
});

expectError(createServer({
  models: {
    pet: Model.extend({}),
  },
  identityManagers: {
    pet: IdentityManager,
    foo: IdentityManager,
  },
}));
