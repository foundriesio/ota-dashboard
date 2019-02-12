module.exports = {
    plugins: [
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-transform-regenerator',
        [
            '@babel/plugin-transform-runtime',
            {
                'corejs': false,
                'helpers': false,
                'regenerator': false,
                'useESModules': false
            }
        ]
    ],
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'entry',
                forceAllTransforms: true
            }
        ]
    ]
};
