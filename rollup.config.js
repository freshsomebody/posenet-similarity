import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/posenet-similarity.min.js',
      format: 'umd',
      name: 'pns'
    }
  ],
  plugins: [
    typescript(),
    terser()
  ]
};