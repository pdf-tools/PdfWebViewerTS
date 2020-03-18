import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'

const plugins = [
  resolve({}),
  commonjs({
    include: 'node_modules/**'
  }),
  uglify({
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true
    }
  })
]

export default [
  {
    input: './build/dist/es/index.js',
    output: {
      file: './build/dist/browser/pdf-web-viewer.js',
      format: 'umd',
      name: 'PdfTools'
    },
    plugins: plugins
  }
]
