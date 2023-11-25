import { uglify } from "rollup-plugin-uglify";
import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/main.js',
  plugins: [
		// uglify(),
		typescript()
	],
	output: {
		file: 'dist/quail.min.js',
		format: 'es',
		name: 'quail',
		sourcemap: true
	}
};