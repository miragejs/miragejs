import path from "path";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import alias from "rollup-plugin-alias";
import multiEntry from "rollup-plugin-multi-entry";
import transformAsync from "rollup-plugin-async";

export default {
  input: "working-tests/**/*.js",
  output: {
    dir: "dist/tests",
    format: "umd",
    name: "MirageJS.Server",
    globals: {
      qunit: "QUnit"
    }
  },
  external: ["qunit"],
  plugins: [
    transformAsync(),
    commonjs({
      include: ["node_modules/**"],
      namedExports: {
        qunit: ["module", "test"]
      }
    }),
    alias({
      "@miragejs/server": path.resolve(process.cwd(), "./lib/index.js")
    }),
    resolve(),
    babel({
      exclude: "node_modules/**",
      babelrc: false,
      comments: false,
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false
          }
        ]
      ],
      plugins: [
        "@babel/plugin-transform-regenerator",
        "@babel/plugin-transform-async-to-generator"
      ]
    }),
    multiEntry()
  ]
};
