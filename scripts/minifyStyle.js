const fs = require('fs');

const CleanCSS = require('clean-css');
const program = require('commander').program;

const opts = program
    .storeOptionsAsProperties(false)
    .requiredOption(
        '--styles <path...>',
        null,
        (value, previous) => previous.concat(fs.realpathSync(value)),
        []
    )
    .requiredOption('--output <path>', null, (path) => fs.realpathSync(path))
    .requiredOption('--name <string>')
    .parse(process.argv)
    .opts();

(async () => {
    let result = '';
    opts.styles.forEach((style) => {
        result += fs.readFileSync(style).toString();
    });
    // see https://github.com/sveltejs/svelte/issues/4374
    result = result.replace(/(\.[^.]+)\1+/g, '$1');
    // TODO: cssnano doesn't merge rules but its the only minifier to simplify calc().
    result = new CleanCSS({
        level: {
            2: {
                all: true
            }
        }
    }).minify(result).styles;
    fs.writeFileSync(`${opts.output}/${opts.name}.css`, result);
})();
