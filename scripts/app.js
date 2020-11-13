const fs = require('fs');

const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve;
const program = require('commander').program;
const replace = require('@rollup/plugin-replace');
const rollup = require('rollup').rollup;
const svelte = require('rollup-plugin-svelte');
const sveltePreprocess = require('svelte-preprocess');
const terser = require('rollup-plugin-terser').terser;
const typescript = require('@rollup/plugin-typescript');

const opts = program
    .storeOptionsAsProperties(false)
    .option('--demo', null, false)
    .option('--minify', null, false)
    .requiredOption('--output <path>', null, (path) => fs.realpathSync(path))
    .requiredOption('--file <path>', null, (path) => fs.realpathSync(path))
    .requiredOption('--name <string>')
    .parse(process.argv)
    .opts();

(async () => {
    const bundle = await rollup({
        onwarn: (warning, defaultHandler) => {
            if (warning.code == 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT') return;
            defaultHandler(warning);
        },
        input: opts.file,
        plugins: [
            replace({ __DEMO__: opts.demo }),
            svelte({
                css: (css) => css.write(`${opts.name}.css`, false),
                preprocess: [
                    {
                        markup: (input) => {
                            // aggressive html whitespace collapse
                            const content = input.content;
                            const matches = [
                                ...content.matchAll(
                                    /<script.*?>.*?<\/script>|<style.*?>.*?<\/style>/gs
                                ),
                            ];
                            const result = content.replace(
                                /(?<=>)\s+|\s+(?=<)/g,
                                (matched, offset) => {
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
                                }
                            );

                            return { code: result };
                        },
                    },
                    sveltePreprocess(),
                ],
            }),
            nodeResolve({ browser: true, dedupe: ['svelte'] }),
            commonjs({ sourceMap: false }),
            typescript({
                tsconfig: `src/app/tsconfig.json`
            }),
            opts.minify &&
                terser({
                    ecma: 2017,
                    compress: {
                        arguments: true,
                        booleans_as_integers: true,
                        drop_console: true,
                        keep_fargs: false,
                        passes: 2,
                        unsafe: true,
                        unsafe_arrows: true,
                        unsafe_Function: true,
                        unsafe_math: true,
                        unsafe_symbols: true,
                        unsafe_methods: true,
                        unsafe_proto: true,
                        unsafe_regexp: true,
                        unsafe_undefined: true,
                    },
                    format: { comments: false },
                    toplevel: true,
                }),
        ],
    });
    await bundle.write({ format: 'iife', file: `${opts.output}/${opts.name}.js` });
})();
