const path = require('path');
const fs = require('fs');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AutoDllPlugin = require('autodll-webpack-plugin');
function htmlPlugins (src, names){
    let arr = [];
    names.forEach((name)=>{
        arr.push(new HtmlWebpackPlugin({
            filename:`${name}.html`,
            template:`${src}/${name}/${name}.html`,
            inject: true,
            chunks:[name]
        }))
    })
    return arr;
}

module.exports = (env = {})=>{
    let src = env.src;
    let appNames = fs.readdirSync(src), appEntry = {};
    appNames.forEach((name)=>{
        appEntry[name] = `${src}/${name}/${name}.js`;
    });
    return {
        entry: appEntry,
        output:{
            filename:`js/[name]_[hash:8].js`,
            path:path.resolve(__dirname, 'dist'),
        },
        module:{
            rules:[
                {
                    test:/(\.js|\.jsx)$/,
                    exclude:[
                        path.resolve(__dirname, 'node_modules'),
                    ],
                    use:['babel-loader'],                    
                },
                {
                    test:/(\.scss)$/,
                    use:ExtractTextPlugin.extract({
                        fallback:'style-loader',
                        use:[
                            'css-loader?minimize',
                            'sass-loader',
                        ],
                    })
                },
                {
                    test:/(\.css)$/,
                    use:ExtractTextPlugin.extract({
                        fallback:'style-loader',
                        use:[
                            'css-loader?minimize',
                        ]
                    })
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                      limit: 10000,
                      name: '/image/[name].[hash:7].[ext]',
                    }
                  },
                  {
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                      limit: 10000,
                      name: '/media/[name].[hash:7].[ext]'
                    }
                  },
                  {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                      limit: 10000,
                      name: '/fonts/[name].[hash:7].[ext]'
                    }
                  }
            ]
        },

        plugins:[
            ...htmlPlugins(env.src, appNames),
            new AutoDllPlugin({//导出公共包使用缓存减少构建时间
                entry:{
                    vendor:[
                        'react',
                        'react-dom'
                    ]
                },
                inject:true,
                filename:`[name].js`,
                path:'js',
            }),
            new ExtractTextPlugin({
                filename:`style/[name]_[contenthash:8].css`,
            }),
        ],
        devServer:{
            contentBase:path.join(__dirname,'dist'),
        }   
    }
}