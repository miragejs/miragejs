import IdentityManager from "miragejs/identity-manager";

const identityManager = new IdentityManager();

identityManager.get(); // $ExpectType number
identityManager.set("id"); // $ExpectType void
identityManager.inc(); // $ExpectType number
identityManager.fetch(); // $ExpectType string
identityManager.reset(); // $ExpectType void
