import fs from "fs";
import path from "path";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import alias from "rollup-plugin-alias";

function isBareModuleId(id) {
  return !id.startsWith(".") && !id.includes(path.join(process.cwd(), "lib"));
}

let esm = {
  input: "lib/index.js",
  output: { file: `dist/mirage-ems.js`, sourcemap: true, format: "esm" },
  external: isBareModuleId,
  plugins: [
    babel({
      exclude: "node_modules/**",
      sourceMaps: true,
      presets: [["@babel/preset-env", {}]]
    })
  ]
};

let cjs = {
  input: "lib/index.js",
  output: {
    file: `dist/mirage-cjs.js`,
    sourcemap: true,
    format: "cjs",
    esModule: true
  },
  external(id) {
    // in cjs pretender isn't external since we are going to override
    // it with our own shim.
    return id !== "pretender" && isBareModuleId(id);
  },
  plugins: [
    alias({
      "@miragejs/server": path.resolve(process.cwd(), "./")
    }),
    {
      load(id) {
        if (id.indexOf("pretender") > -1) {
          let umdId = id.replace(".es.js", ".js");

          return `
            export default function(...args) {
              if (typeof window !== 'undefined') {
                ${fs.readFileSync(umdId, "utf-8")}

                return new Pretender(...args);
              }
            }
          `;
        }
      }
    },
    babel({
      exclude: "node_modules/**",
      sourceMaps: true,
      presets: [
        [
          "@babel/preset-env",
          {
            targets: { node: "current" }
          }
        ]
      ]
    }),
    resolve()
  ]
};

let umd = {
  input: "lib/index.js",
  output: {
    file: "dist/mirage-umd.js",
    format: "umd",
    name: "MirageJS.Server"
  },
  plugins: [
    commonjs(),
    alias({
      "@miragejs/server": path.resolve(process.cwd(), "./")
    }),
    resolve(),
    babel({
      exclude: "node_modules/**",
      sourceMaps: true,
      presets: [
        [
          "@babel/preset-env",
          {
            useBuiltIns: "usage",
            corejs: 3,
            modules: false,
            targets: "ie 11"
          }
        ]
      ]
    })
  ]
};

// export default [esm, cjs, umd];
export default [cjs];
