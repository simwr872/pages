import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import replace from '@rollup/plugin-replace';

const MINIFY = !!process.env.MINIFY;
const DEMO = !!process.env.DEMO;

export default {
    onwarn: (warning, next) => {
        if (warning.code == 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT') return;
        next(warning);
    },
    input: 'src/main.ts',
    output: {
        sourcemap: !MINIFY,
        format: 'iife',
        file: 'public/build/bundle.js',
    },
    plugins: [
        replace({
            'process.env.DEMO': DEMO,
        }),
        svelte({
            dev: !MINIFY,
            css: (css) => {
                css.write('bundle.css', !MINIFY);
            },
            preprocess: [
                {
                    markup: (opts) => {
                        let content = opts.content;
                        let matches = [
                            ...content.matchAll(
                                /<script.*?>.*?<\/script>|<style.*?>.*?<\/style>/gs
                            ),
                        ];

                        return {
                            code: content.replace(/(?<=>)\s+|\s+(?=<)/g, (matched, offset) => {
                                for (let i = 0; i < matches.length; i++) {
                                    let match = matches[i];
                                    if (
                                        match.index <= offset &&
                                        offset <= match.index + match[0].length
                                    ) {
                                        return matched;
                                    }
                                }
                                return '';
                            }),
                        };
                    },
                },
                sveltePreprocess(),
            ],
        }),
        resolve({
            browser: true,
            dedupe: ['svelte'],
        }),
        commonjs(),
        typescript({
            sourceMap: !MINIFY,
            inlineSources: !MINIFY,
        }),
        MINIFY && terser(),
    ],
    watch: {
        clearScreen: false,
    },
};
