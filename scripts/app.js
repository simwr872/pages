const fs = require('fs');

const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve;
const program = require('commander').program;
const rollup = require('rollup').rollup;
const svelte = require('rollup-plugin-svelte');
const sveltePreprocess = require('svelte-preprocess');
const typescript = require('@rollup/plugin-typescript');
const css = require('rollup-plugin-css-only');

const opts = program
    .storeOptionsAsProperties(false)
    .requiredOption('--output <path>', null, (path) => fs.realpathSync(path))
    .requiredOption('--input <path>', null, (path) => fs.realpathSync(path))
    .parse(process.argv)
    .opts();

(async () => {
    const bundle = await rollup({
        onwarn: (warning, defaultHandler) => {
            if (warning.code == 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT') return;
            defaultHandler(warning);
        },
        input: opts.input,
        plugins: [
            svelte({
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
            css({ output: 'bundle.css' }),
            nodeResolve({ browser: true, dedupe: ['svelte'] }),
            commonjs({ sourceMap: false }),
            typescript({
                tsconfig: `src/tsconfig.json`,
            }),
        ],
    });
    await bundle.write({ format: 'iife', file: `${opts.output}/bundle.js` });
})();
