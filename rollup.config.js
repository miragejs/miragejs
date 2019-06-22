/* global process */
import path from "path";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import alias from "rollup-plugin-alias";

export default {
  input: "lib/index.js",
  output: {
    file: "dist/index.js",
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
      babelrc: false,
      comments: false,
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false
          }
        ]
      ]
    })
  ]
};
