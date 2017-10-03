import buble from 'rollup-plugin-buble'

export default {
  name: 'WeexMarkdownComponent',
  input: './src/markdown.js',
  output: {
    format: 'umd',
    file: './index.js',
  },
  plugins: [
    buble()
  ]
}
