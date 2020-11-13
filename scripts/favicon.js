const fs = require('fs');

const sharp = require('sharp');
const program = require('commander').program;

const opts = program
    .storeOptionsAsProperties(false)
    .requiredOption(
        '--sizes <number...>',
        null,
        (value, previous) => previous.concat(parseInt(value)),
        []
    )
    .requiredOption('--icon <path>', null, (value) => fs.realpathSync(value))
    .requiredOption('--output <path>', null, (value) => fs.realpathSync(value))
    .parse(process.argv)
    .opts();

const image = sharp(opts.icon);
Promise.all(opts.sizes.map((size) => image.resize(size).toFile(`${opts.output}/${size}.png`)));
