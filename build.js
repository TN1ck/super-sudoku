var webpack = require('webpack');
var config = require('./webpack.config');

webpack(config, function(err, stats) {
    console.log(err);
    console.log(stats.toString({
        'colors': true,
        'display-error-details': true
    }));
});
