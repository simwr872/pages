const fs = require('fs');
const path = require('path');

const program = require('commander').program;

const opts = program
    .storeOptionsAsProperties(false)
    .requiredOption('--input <path>', null, (path) => fs.realpathSync(path))
    .requiredOption('--output <path>')
    .requiredOption('--info <string>', null, (path) => fs.realpathSync(path))
    .parse(process.argv)
    .opts();

let script = fs.readFileSync(opts.input).toString();
let info = JSON.parse(fs.readFileSync(opts.info).toString());
info.forEach(([pattern, codepoint]) => {
    script = script.replace(new RegExp(pattern, 'g'), codepoint);
});
fs.writeFileSync(opts.output, script);
