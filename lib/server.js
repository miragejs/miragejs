import BrowserServer from "./server/browser";
import NodeServer from "./server/node";

/**
  @hide
*/
const defaultPassthroughs = [
  "http://localhost:0/chromecheckurl", // mobile chrome
  "http://localhost:30820/socket.io" // electron
];

/**
  @hide
*/
export { defaultPassthroughs };

let Server = typeof window === "undefined" ? NodeServer : BrowserServer;
export default Server;
