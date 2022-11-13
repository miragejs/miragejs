export default function assert(bool: boolean, text: string = "") {
  if (typeof bool === "string" && !text) {
    throw new MirageError(bool);
  }

  if (!bool) {
    throw new MirageError(text.replace(/^ +/gm, "") || "Assertion failed");
  }
}

export class MirageError extends Error {
  constructor(message: string, stack?: string) {
    super();
    if (stack) {
      this.stack = `Mirage: ${stack}`;
    }
    this.name = "MirageError";
    this.message = `Mirage: ${message}`;
  }
}
