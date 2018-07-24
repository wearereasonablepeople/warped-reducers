import babel from 'rollup-plugin-babel';

export default {
  input: 'index.mjs',
  output: {
    format: 'umd',
    name: 'warpedReducers',
    file: 'index.js',
    interop: false
  },
  plugins: [
    babel ({
      exclude: 'node_modules/**'
    })
  ]
};
