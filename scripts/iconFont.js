const fs = require('fs');
const path = require('path');

const program = require('commander').program;
const svg2ttf = require('svg2ttf');
const SVGIcons2SVGFontStream = require('svgicons2svgfont');
const ttf2woff2 = require('ttf2woff2');

const opts = program
    .storeOptionsAsProperties(false)
    .requiredOption(
        '--icons <path...>',
        null,
        (value, previous) => previous.concat(fs.realpathSync(value)),
        []
    )
    .requiredOption('--replace <path>', null, (path) => fs.realpathSync(path))
    .requiredOption('--output <path>', null, (path) => fs.realpathSync(path))
    .requiredOption('--name <string>')
    .parse(process.argv)
    .opts();

(async () => {
    let svgFont = `${opts.output}/${opts.name}.svg`;
    let codepoint = 0xe000;
    const map = Object.fromEntries(
        opts.icons.map((icon) => [icon, String.fromCharCode(codepoint++)])
    );

    const fontStream = new SVGIcons2SVGFontStream({
        fontName: opts.name,
        normalize: true,
        fontHeight: 1000,
        centerhorizontally: true,
    });

    const promise = new Promise((resolve) =>
        fontStream.pipe(fs.createWriteStream(svgFont)).on('finish', resolve)
    );

    Object.entries(map).forEach(([icon, codepoint], index) => {
        const glyph = fs.createReadStream(icon);
        glyph.metadata = {
            unicode: [codepoint],
            name: `${index}`,
        };
        fontStream.write(glyph);
    });
    fontStream.end();

    await promise;

    const svg = fs.readFileSync(svgFont, 'utf8');
    const ttf = svg2ttf(svg);
    const woff2 = ttf2woff2(ttf.buffer);

    fs.writeFileSync(`${opts.output}/${opts.name}.woff2`, Buffer.from(woff2.buffer));
    fs.unlinkSync(svgFont);

    let script = fs.readFileSync(opts.replace).toString();
    Object.entries(map).forEach(([icon, codepoint]) => {
        const name = path.basename(icon).slice(0, -4);
        const pattern = new RegExp(`&${name};`, 'g');
        script = script.replace(pattern, codepoint);
    });
    fs.writeFileSync(`${opts.output}/${path.basename(opts.replace)}`, script);
})();
