import { uglify } from "rollup-plugin-uglify";
import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/client.ts',
  plugins: [
		uglify(),
		typescript()
	],
	output: {
		file: 'dist/quail.min.js',
		format: 'iife',
		name: 'quail'
	}
};