const fs = require('fs');

const program = require('commander').program;
const terser = require('terser').minify;
const astring = require('astring');
const estraverse = require('estraverse');
const acorn = require('acorn');

const opts = program
    .storeOptionsAsProperties(false)
    .requiredOption('--input <path>', null, (value) => fs.realpathSync(value))
    .requiredOption('--output <path>')
    .parse(process.argv)
    .opts();

(async () => {
    let result = fs.readFileSync(opts.input).toString();

    let ast = acorn.parse(result, { ecmaVersion: 2017 });
    let stack = [];
    // swap 'const' and 'var' to 'let' and rewrite functions to arrow functions
    ast = estraverse.replace(ast, {
        enter: function (node) {
            if (node.type === 'FunctionExpression') {
                stack.push(false);
            } else if (node.type === 'FunctionDeclaration') {
                stack.push(false);
            } else if (node.type === 'ThisExpression') {
                stack[stack.length - 1] = true;
            } else if (node.type === 'VariableDeclaration') {
                node.kind = 'let';
                return node;
            }
        },
        leave: function (node) {
            if (node.type === 'FunctionExpression') {
                if (!stack.pop()) {
                    // no this call
                    node.type = 'ArrowFunctionExpression';
                    return node;
                }
            } else if (node.type === 'FunctionDeclaration') {
                if (!stack.pop()) {
                    // no this call
                    node.type = 'ArrowFunctionExpression';
                    let id = { ...node.id };
                    node.id = null;
                    return {
                        type: 'VariableDeclaration',
                        kind: 'let',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: id,
                                init: node,
                            },
                        ],
                    };
                }
            }
        },
    });
    result = astring.generate(ast);

    result = (
        await terser(result, {
            ecma: 2017,
            compress: {
                passes: 5,
                arguments: true,
                booleans_as_integers: true,
                drop_console: true,
                keep_fargs: false,
                passes: 5,
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
        })
    ).code;
    fs.writeFileSync(opts.output, result);
})();
