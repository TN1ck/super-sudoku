const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const SplitByPathPlugin = require('webpack-split-by-path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

//
// LOADERS
//

const loaders = {};

loaders.js = {
    test: /\.(jsx?)$/,
    loaders: ['babel-loader?retainLines=true'],
    exclude: /node_modules/
};

loaders.tsx = {
    test: /\.(tsx?)$/,
    loaders: ['awesome-typescript-loader?useBabel=true&useCache=true'],
    exclude: /node_modules/
};

loaders.html = {
    test: /\.html$/,
    loader: 'raw',
    exclude: /node_modules/
};

const localPostLoader = 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader';
loaders.css = {
    test: /\.css$/,
    loader: IS_PRODUCTION ?
        ExtractTextPlugin.extract('style-loader', localPostLoader) : ('style' + '!' + localPostLoader),
    exclude: /(node_modules|\.global\.css)/
};

const globalPostLoader = 'css-loader!postcss-loader';
loaders.globalcss = {
    test: /\.global.css$/,
    loader: IS_PRODUCTION ?
        ExtractTextPlugin.extract('style-loader', globalPostLoader) : ('style' + '!' + globalPostLoader),
    exclude: /node_modules/
};

loaders.json = {
    test: /\.json$/,
    loader: 'json'
};

loaders.ttfeot = {
    test: /\.(ttf|eot)$/i,
    loader: 'file?hash=sha512&digest=hex&name=fonts/[name].[ext]?[hash]'
};

loaders.woff = {
    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'url-loader?limit=10000&minetype=application/font-woff&name=fonts/[name].[ext]?[hash]'
};

loaders.image = {
    test: /\.(jpe?g|png|gif|svg)$/i,
    loader: 'file?hash=sha512&digest=hex&name=images/[name]-[hash].[ext]'
};

//
// PLUGINS
//

const sourceMap = process.env.TEST || process.env.NODE_ENV !== 'production'
  ? [new webpack.SourceMapDevToolPlugin({ filename: null, test: /\.tsx?$/ })]
  : [];

const basePlugins = [
    new webpack.DefinePlugin({
        'process.env': {
            __DEV__: process.env.NODE_ENV !== 'production',
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            BACKEND_URL: JSON.stringify(process.env.BACKEND_URL)
        }
    }),
    new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body'
    }),
    new webpack.NoErrorsPlugin(),
    new CopyWebpackPlugin([
        { from: 'src/assets', to: 'assets' }
    ]),
].concat(sourceMap);

const devPlugins = [
    new StyleLintPlugin({
        configFile: './.stylelintrc',
        files: ['src/styles/*.css'],
        failOnError: false
    }),
    new ForkCheckerPlugin(),
    new webpack.HotModuleReplacementPlugin()
];

const prodPlugins = [
    new ExtractTextPlugin('style.css', { allChunks: true })
];

const plugins = basePlugins
  .concat(process.env.NODE_ENV === 'production' ? prodPlugins : [])
  .concat(process.env.NODE_ENV !== 'production' ? devPlugins : []);

//
// POSTCSS
//

const postcssBasePlugins = [
    require('postcss-modules-local-by-default'),
    require('postcss-import')({
        addDependencyTo: webpack
    }),
    require('postcss-cssnext'),
    require('postcss-nested')
];
const postcssDevPlugins = [];
const postcssProdPlugins = [
    require('cssnano')({
        safe: true,
        sourcemap: true,
        autoprefixer: false
    })
];

const postcssPlugins = postcssBasePlugins
  .concat(process.env.NODE_ENV === 'production' ? postcssProdPlugins : [])
  .concat(process.env.NODE_ENV === 'development' ? postcssDevPlugins : []);

const postcssInit = () => {
    return postcssPlugins;
};

//
// ENTRY
//

const applicationEntries = IS_PRODUCTION ? ['./src/index'] : [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://0.0.0.0:8080',
    'webpack/hot/only-dev-server',
    './src/index'
];

module.exports = {
    entry: applicationEntries,

    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[hash].js',
        publicPath: '/',
        sourceMapFilename: '[name].[hash].js.map',
        chunkFilename: '[id].chunk.js'
    },

    devtool: IS_PRODUCTION ?
      'source-map' :
      'inline-source-map',

    resolve: {
        root: path.resolve('./'),
        extensions: [
            '',
            '.webpack.js',
            '.web.js',
            '.tsx',
            '.ts',
            '.js',
            '.json'
        ]
    },

    plugins: plugins,

    devServer: {
        historyApiFallback: { index: '/' }
    },

    module: {
        loaders: [
            loaders.tsx,
            loaders.html,
            loaders.image,
            loaders.globalcss,
            loaders.css,
            loaders.ttfeot,
            loaders.woff,
            loaders.json
        ]
    },

    externals: {
        'react/lib/ReactContext': 'window',
        'react/lib/ExecutionEnvironment': true,
        'react/addons': true
    },

    postcss: postcssInit
};
