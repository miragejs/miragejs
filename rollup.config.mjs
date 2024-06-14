import path from "path";
import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";

let aliases = {
  entries: [
    {
      find: /@lib(.*)/,
      replacement: path.resolve(process.cwd(), "./lib$1.js"),
    },
  ],
};

function isExternal(id) {
  /*
    Here, `id` is "./db", as in

      import db from './db'
  */
  let isRelativeInternalModulePath = id.startsWith(".");

  /*
    Here, `id` is something like

      "/Users/samselikoff/Projects/oss/miragejs/miragejs/lib/identity-manager.js"

    I'm not sure how this happens, but it's referencing an internal module, so
    it shouldn't be treated as external.
  */
  let isAbsoluteInternalModulePath = id.includes(
    path.join(process.cwd(), "lib")
  );

  /*
    Here, `id` is something like '@lib/assert', which is not a path but does
    reference an internal module. So it shouldn't be treated as external.
  */
  let isAlias = Boolean(
    aliases.entries.find((entry) => {
      if (entry.find instanceof RegExp) {
        return entry.find.test(id);
      } else if (typeof entry.find === "string") {
        return id.startsWith(entry.find);
      }
    })
  );

  return (
    !isRelativeInternalModulePath && !isAbsoluteInternalModulePath && !isAlias
  );
}

let esm = {
  input: "lib/index.js",
  output: { file: `dist/mirage.mjs`, sourcemap: true, format: "esm" },
  external: isExternal,
  plugins: [
    alias(aliases),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      sourceMaps: true,
      configFile: false,
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              esmodules: true,
            },
          },
        ],
      ],
    }),
  ],
};

let cjs = {
  input: "lib/index.js",
  output: {
    file: `dist/mirage.cjs`,
    sourcemap: true,
    format: "cjs",
    esModule: true,
  },
  external: isExternal,
  plugins: [
    alias(aliases),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      sourceMaps: true,
      configFile: false,
      presets: [
        [
          "@babel/preset-env",
          {
            targets: { node: "current" },
          },
        ],
      ],
    }),
    nodeResolve(),
  ],
};

let umd = {
  input: "lib/index.js",
  output: {
    file: "dist/mirage-umd.cjs",
    format: "umd",
    name: "MirageJS.Server",
  },
  plugins: [
    commonjs(),
    alias(aliases),
    nodeResolve(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      sourceMaps: true,
      configFile: false,
      presets: [
        [
          "@babel/preset-env",
          {
            useBuiltIns: "usage",
            corejs: 3,
            modules: false,
            targets: "ie 11",
          },
        ],
      ],
    }),
  ],
};

export default [esm, cjs, umd];
