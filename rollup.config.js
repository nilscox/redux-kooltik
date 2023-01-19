import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    plugins: [esbuild()],
    input: 'src/index.ts',
    output: [
      {
        file: `dist/index.cjs.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `dist/index.esm.js`,
        format: 'es',
        sourcemap: true,
      },
    ],
  },
  {
    plugins: [dts()],
    input: 'src/index.ts',
    output: {
      file: `dist/index.d.ts`,
      format: 'es',
    },
  },
];
