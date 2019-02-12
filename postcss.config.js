module.exports = {
    syntax: 'postcss-scss',
    map: false,
    processors: [
        require('postcss-strip-inline-comments')
    ],
    plugins: [
        require('postcss-import'),
        require('postcss-flexbugs-fixes'),
        require('postcss-preset-env')({
            stage: 4
        }),
        require('cssnano')({
            preset: 'advanced',
        }),
    ],
};
