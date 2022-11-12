/* eslint no-console: 0 */
let errorProps = [
  "description",
  "fileName",
  "lineNumber",
  "message",
  "name",
  "number",
  "stack",
];

export default function assert(bool: boolean, text: string = '') {
  if (typeof bool === "string" && !text) {
    // console.error(`Mirage: ${bool}`);
    throw new MirageError(bool);
  }

  if (!bool) {
    // console.error(`Mirage: ${text}`);
    throw new MirageError(text.replace(/^ +/gm, "") || "Assertion failed");
  }
}

/**
  @public
  @hide
  Copied from ember-metal/error
*/

class MirageError extends Error {
  props: {
    [key: string]: string;
  } = {};
  constructor(message: string, stack?: string) {
    super('TODO');
    let tmp = Error(message);
    if (stack) {
      tmp.stack = stack;
    }
    for (let idx = 0; idx < errorProps.length; idx++) {
      let prop = errorProps[idx];
  
      if (["description", "message", "stack"].indexOf(prop) > -1) {
        // @ts-ignore
        this.props[prop] = `Mirage: ${tmp[prop]}`;
      } else {
        // @ts-ignore
        this.props[prop] = tmp[prop];
      }
    }
  }
}

