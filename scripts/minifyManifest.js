const fs = require('fs');

const program = require('commander').program;

const opts = program
    .storeOptionsAsProperties(false)
    .requiredOption('--file <path>', null, (value) => fs.realpathSync(value))
    .requiredOption('--output <path>', null, (value) => fs.realpathSync(value))
    .requiredOption('--name <string>')
    .parse(process.argv)
    .opts();

let result = fs.readFileSync(opts.file).toString();
result = JSON.stringify(JSON.parse(result));
fs.writeFileSync(`${opts.output}/${opts.name}.webmanifest`, result);
