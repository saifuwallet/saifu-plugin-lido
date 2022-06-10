import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import tailwindcss from 'tailwindcss';
import colors from 'tailwindcss/colors';
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
  external: ['saifu', 'react', 'react-dom',  '@saifuwallet/saifu-ui', '@babel/runtime/helpers/interopRequireDefault'],
  plugins: [
    commonjs({}),
    postcss({
      inject: true,
      minimize: true,
      plugins: [
        new tailwindcss({
          corePlugins: {
            preflight: false
          },
          darkMode: 'class',
          content: ['./src/**/*.{js,jsx,ts,tsx}', './node_modules/@saifuwallet/saifu-ui/dist/**/*.js'],
          theme: {
            screen: {
              // change small to extension width
              sm: '350px',
              md: '768px',
              // => @media (min-width: 768px) { ... }

              lg: '1024px',
              // => @media (min-width: 1024px) { ... }

              xl: '1280px',
              // => @media (min-width: 1280px) { ... }

              '2xl': '1536px',
            },
            extend: {
              colors: {
                orange: colors.orange,
              },
            },
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
