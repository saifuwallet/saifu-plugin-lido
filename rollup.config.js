import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

export default {
  input: 'src/main.tsx',
  output: {
    dir: 'dist',
    sourcemap: (!isProd && 'inline') || false,
    format: 'system',
    exports: 'default',
  },
  external: ['saifu', 'react', 'react-dom', '@babel/runtime/helpers/interopRequireDefault'],
  plugins: [
    commonjs({}),
    postcss({
      inject: true,
      minimize: true,
      plugins: [
        new tailwindcss({
          content: ['./src/**.{js,jsx,ts,tsx}'],
          theme: {
            extend: {},
          },
          variants: {},
          plugins: [],
          corePlugins: {
            preflight: false,
          },
        }),
        new autoprefixer(),
      ],
    }),
    globals(),
    builtins(),
    json(),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      ignoreGlobal: false,
      include: ['node_modules/**'],
      skip: ['@saifuwallet/saifu', 'react', 'react-dom', '@babel/runtime'],
    }),
    typescript({
      declaration: !isProd,
    }),
    copy({
      targets: [{ src: './metadata.json', dest: './dist' }],
    }),
  ],
};
