const fs = require('fs');

const cssnano = require('cssnano');
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
    result = await cssnano.process(result);
    // see https://github.com/sveltejs/svelte/issues/4374
    result = result.css.replace(/(\.[^.]+)\1+/g, '$1');
    fs.writeFileSync(`${opts.output}/${opts.name}.css`, result);
})();
