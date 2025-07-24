/**
 * Rollup configuration for GeniStudio Web Chat Widget
 * Simplified for CDN-only usage
 */
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import { readFileSync } from 'fs';

// Read package.json manually since direct JSON import requires type attribute
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Banner for the top of each file
const banner = `/**
 * GeniStudio Web Chat Widget v${pkg.version}
 * ${pkg.homepage}
 * 
 * @license ${pkg.license}
 * Copyright ${new Date().getFullYear()} ${pkg.author}
 */`;

const config = {
  input: 'src/index.js',
  output: {
    name: 'GeniStudioWebChat',
    file: 'dist/index.cdn.js',
    format: 'iife',
    sourcemap: true,
    banner,
    exports: 'named',
  },
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    postcss({
      // Extract all CSS to separate files
      extract: true,
      minimize: true,
      sourceMap: true,
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', { targets: '> 0.25%, not dead' }]
      ],
      extensions: ['.js']
    }),
    terser({
      format: {
        comments: function(node, comment) {
          return comment.type === 'comment2' && /GeniStudio Web Chat Widget/.test(comment.value);
        }
      }
    })
  ]
};

export default config;
