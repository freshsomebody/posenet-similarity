import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: 'src/index.ts', // our source file
  output: [
    {
      file: 'dist/posenet-similarity.min.js',
      format: 'umd',
      name: 'pns'
    }
  ],
  plugins: [
    typescript(),
    uglify()
  ]
};