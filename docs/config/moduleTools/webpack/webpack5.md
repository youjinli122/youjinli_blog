## 1. webpack5 新特性介绍

- 启动命令
- 持久化缓存
- 资源模块
- moduleIds & chunkIds 的优化
- 更智能的 tree shaking
- nodeJs 的 polyfill 脚本被移除
- 模块联邦

## 2.启动命令

### 2.1 安装

```
npm install webpack webpack-cli webpack-dev-server html-webpack-plugin babel-loader @babel/core  @babel/preset-env @babel/preset-react style-loader css-loader --save-dev
npm install react react-dom --save
```

### 2.2 webpack.config.js

```
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode: 'development',
    devtool: false,
    module:{
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                "@babel/preset-react"
                            ]
                        },

                    }
                ],
                exclude:/node_modules/
            }
        ]
    },
    devServer:{},
    plugins:[
        new HtmlWebpackPlugin({
            template:'./public/index.html'
        })
    ]
}
```

### 2.3 public\index.html

public\index.html

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>webpack5</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

### 2.4 src\index.js

src\index.js

```
import React from 'react';
import ReactDOM from 'react-dom';
ReactDOM.render(<h1>hello</h1>,root);
```

### 2.5 package.json

package.json

```
{
  "scripts": {
    "build": "webpack",
    "start": "webpack serve"
  }
}
```

### 3.持久化缓存

- webpack 会缓存生成的 webpack 模块和 chunk,来改善构建速度
- 缓存在 webpack5 中默认开启，缓存默认是在内存里,但可以对 cache 进行设置
- webpack 追踪了每个模块的依赖，并创建了文件系统快照。此快照会与真实文件系统进行比较，当检测到差异时，将触发对应模块的重新构建

### 3.1 webpack.config.js

```
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode: 'development',
+   cache: {
+       type: 'filesystem',  //'memory' | 'filesystem'
+       cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'),
+   },
    devtool: false,
    module:{
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                "@babel/preset-react"
                            ]
                        },

                    }
                ],
                exclude:/node_modules/
            }
        ]
    },
    devServer:{},
    plugins:[
        new HtmlWebpackPlugin({
            template:'./public/index.html'
        })
    ]
}
```

## 4.资源模块

- 资源模块是一种模块类型，它允许使用资源文件（字体，图标等）而无需配置额外 loader
- raw-loader => asset/source 导出资源的源代码
- file-loader => asset/resource 发送一个单独的文件并导出 URL
- url-loader => asset/inline 导出一个资源的 data URI
- asset 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 url-loader，并且配置资源体积限制实现
  Rule.type
  asset-modules

### 4.1 webpack.config.js

```
module.exports = {
    module:{
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                "@babel/preset-react"
                            ]
                        },

                    }
                ],
                exclude:/node_modules/
            },
+           {
+               test: /\.png$/,
+               type: 'asset/resource'
+           },
+           {
+               test: /\.ico$/,
+               type: 'asset/inline'
+           },
+           {
+               test: /\.txt$/,
+               type: 'asset/source'
+           },
+           {
+               test: /\.jpg$/,
+               type: 'asset',
+               parser: {
+                   dataUrlCondition: {
+                     maxSize: 4 * 1024 // 4kb
+                   }
+               }
+           }
        ]
    },
  experiments: {
    asset: true
  },
};
```

### 4.2 src\index.js

src\index.js

```
+ import png from './assets/logo.png';
+ import ico from './assets/logo.ico';
+ import jpg from './assets/logo.jpg';
+ import txt from './assets/logo.txt';
+ console.log(png,ico,jpg,txt);
```

## 5.URIs

- experiments
- Webpack 5 支持在请求中处理协议
- 支持 data 支持 Base64 或原始编码,MimeType 可以在 module.rule 中被映射到加载器和模块类型

### 5.1 src\index.js

src\index.js

```
import data from "data:text/javascript,export default 'title'";
console.log(data);
```

## 6.moduleIds & chunkIds 的优化

### 6.1 概念和选项

- module: 每一个文件其实都可以看成一个 module
- chunk: webpack 打包最终生成的代码块，代码块会生成文件，一个文件对应一个 chunk
- 在 webpack5 之前，没有从 entry 打包的 chunk 文件，都会以 1、2、3...的文件命名方式输出,删除某些些文件可能会导致缓存失效
- 在生产模式下，默认启用这些功能 chunkIds: "deterministic", moduleIds: "deterministic"，此算法采用确定性的方式将短数字 ID(3 或 4 个字符)短\* hash 值分配给 modules 和 chunks
- chunkId 设置为 deterministic，则 output 中 chunkFilename 里的[name]会被替换成确定性短数字 ID
- 虽然 chunkId 不变(不管值是 deterministic | natural | named)，但更改 chunk 内容，chunkhash 还是会改变的
  |可选值| 含义| 示例|
  |-----|-----|----|
  |natural| 按使用顺序的数字 ID| 1|
  |named| 方便调试的高可读性 id| src_two_js.js|
  |deterministic| 根据模块名称生成简短的 hash 值| 915|
  |size| 根据模块大小生成的数字 id |0|

### 6.2 webpack.config.js

webpack.config.js

```
const path = require('path');
module.exports = {
    mode: 'development',
    devtool:false,
+   optimization:{
+       moduleIds:'deterministic',
+       chunkIds:'deterministic'
+   }
}
```

### 6.3 src\index.js

src\index.js

```
import('./one');
import('./two');
import('./three');
```

## 7.移除 Node.js 的 polyfill

- webpack4 带了许多 Node.js 核心模块的 polyfill,一旦模块中使用了任何核心模块(如 crypto)，这些模块就会被自动启用
- webpack5 不再自动引入这些 polyfill

### 7.1 安装

```
cnpm i crypto-js crypto-browserify stream-browserify buffer -D
```

### 7.2 src\index.js

```
import CryptoJS from 'crypto-js';
console.log(CryptoJS.MD5('zhufeng').toString());
```

### 7.3 webpack.config.js

```
    resolve:{
        /* fallback:{
            "crypto": require.resolve("crypto-browserify"),
            "buffer": require.resolve("buffer"),
            "stream":require.resolve("stream-browserify")
        }, */
        fallback:{
            "crypto":false,
            "buffer": false,
            "stream":false
        }
    },
```

## 8.更强大的 tree-shaking

- tree-shaking 就在打包的时候剔除没有用到的代码
- webpack4 本身的 tree shaking 比较简单,主要是找一个 import 进来的变量是否在这个模块内出现过
- webpack5 可以进行根据作用域之间的关系来进行优化
- webpack-deep-scope-demo

### 8.1 webpack4

```
import { isNumber, isNull } from 'lodash';

export isNull(...args) {
  return isNull(...args);
}
```

![cmd-markdown-logo](https://img.zhufengpeixun.com/1608975584282)

### 8.2 deep-scope

#### 8.2.1 src\index.js

src\index.js

```
import {function1} from './module1';
console.log(function1);
```

#### 8.2.2 src\module1.js

src\module1.js

```
export function function1(){
    console.log('function1');
}
export function function2(){
    console.log('function2');
}
```

#### 8.2.3 src\module2.js

src\module2.js

```
export function function3(){
    console.log('function3');
}
export function function4(){
    console.log('function4');
}
```

#### 8.2.4 webpack.config.js

webpack.config.js

```
module.exports = {
+   mode: 'development',
    optimization:{
+       usedExports:true
    }
}
```

### 8.3 sideEffects

- 函数副作用指当调用函数时，除了返回函数值之外，还产生了附加的影响,例如修改全局变量
- 严格的函数式语言要求函数必须无副作用

#### 8.3.1 sideEffects:false

##### 8.3.1.1 src\index.js

src\index.js

```
import './title.js';
```

##### 8.3.1.2 src\title.js

src\title.js

```
document.title = "改标题";
export function getTitle(){
    console.log('getTitle');
}
```

##### 8.3.1.3 package.json

package.json

```
"sideEffects": false,
```

#### 8.3.2 sideEffects:["*.css"]

##### 8.3.2.1 src\index.css

src\index.css

```
body{
    background-color: green;
}
```

##### 8.3.2.2 src\index.css

src\index.css

```
import './index.css';
```

##### 8.3.2.3 package.json

package.json

```
"sideEffects": ["*.css"],
```

## 9.模块联邦

### 9.1.动机

- Module Federation 的动机是为了不同开发小组间共同开发一个或者多个应用
- 应用将被划分为更小的应用块，一个应用块，可以是比如头部导航或者侧边栏的前端组件，也可以是数据获取逻辑的逻辑组件
- 每个应用块由不同的组开发
- 应用或应用块共享其他其他应用块或者库
  ![cmd-markdown-logo](https://img.zhufengpeixun.com/1608392171072)

### 9.2.Module Federation

- 使用 Module Federation 时，每个应用块都是一个独立的构建，这些构建都将编译为容器
- 容器可以被其他应用或者其他容器应用
- 一个被引用的容器被称为 remote, 引用者被称为 host，remote 暴露模块给 host, host 则可以使用这些暴露的模块，这些模块被成为 remote 模块
  ![cmd-markdown-logo](https://img.zhufengpeixun.com/1608722799323)

### 9.3.实战

#### 9.3.1 配置参数

| 字段     | 类型   | 含义                                                                   |
| -------- | ------ | ---------------------------------------------------------------------- |
| name     | string | 必传值，即输出的模块名，被远程引用时路径为${name}/${expose}            |
| library  | object | 声明全局变量的方式，name 为 umd 的 name                                |
| filename | string | 构建输出的文件名                                                       |
| remotes  | object | 远程引用的应用名及其别名的映射，使用时以 key 值作为 name               |
| exposes  | object | 被远程引用时可暴露的资源路径及其别名                                   |
| shared   | object | 与其他应用之间可以共享的第三方依赖，使你的代码中不用重复加载同一份依赖 |

#### 9.3.2 remote

##### 9.3.2.1 remote\webpack.config.js

```
let path = require("path");
let webpack = require("webpack");
let HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        publicPath: "http://localhost:3000/",
    },
    devServer: {
        port: 3000
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-react"]
                    },
                },
                exclude: /node_modules/,
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template:'./public/index.html'
        }),
        new ModuleFederationPlugin({
            filename: "remoteEntry.js",
            name: "remote",
            exposes: {
                "./NewsList": "./src/NewsList",
            }
          })
    ]
}
```

##### 9.3.2.2 remote\src\index.js

remote\src\index.js

```
import("./bootstrap");
```

##### 9.3.2.3 remote\src\bootstrap.js

remote\src\bootstrap.js

```
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
ReactDOM.render(<App />, document.getElementById("root"));
```

##### 9.3.2.4 remote\src\App.js

remote\src\App.js

```
import React from "react";
import NewsList from './NewsList';
const App = () => (
  <div>
    <h2>本地组件NewsList</h2>
    <NewsList />
  </div>
);

export default App;
```

##### 9.3.2.5 remote\src\NewsList.js

remote\src\NewsList.js

```
import React from "react";
export default ()=>(
    <div>新闻列表</div>
)
```

#### 9.3.3 host

##### 9.3.3.1 host\webpack.config.js

host\webpack.config.js

```
let path = require("path");
let webpack = require("webpack");
let HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        publicPath: "http://localhost:8000/",
    },
    devServer: {
        port: 8000
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-react"]
                    },
                },
                exclude: /node_modules/,
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
        new ModuleFederationPlugin({
            filename: "remoteEntry.js",
            name: "host",
            remotes: {
                remote: "remote@http://localhost:3000/remoteEntry.js"
            }
        })
    ]
}
```

##### 9.3.3.2 host\src\index.js

host\src\index.js

```
import("./bootstrap");
```

##### 9.3.3.3 host\src\bootstrap.js

host\src\bootstrap.js

```
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
ReactDOM.render(<App />, document.getElementById("root"));
```

##### 9.3.3.4 host\src\App.js

host\src\App.js

```
import React from "react";
import Slides from './Slides';
const RemoteNewsList = React.lazy(() => import("remote/NewsList"));

const App = () => (
  <div>
    <h2 >本地组件Slides, 远程组件NewsList</h2>
    <Slides />
    <React.Suspense fallback="Loading NewsList">
      <RemoteNewsList />
    </React.Suspense>
  </div>
);
export default App;
```

##### 9.3.3.5 host\src\Slides.js

host\src\Slides.js

```
import React from "react";
export default ()=>(
    <div>轮播图</div>
)
```

### 9.4.shared

- shared 配置主要是用来避免项目出现多个公共依赖

#### 9.4.1 remote\webpack.config.js

```
    plugins: [
        new HtmlWebpackPlugin({
            template:'./public/index.html'
        }),
        new ModuleFederationPlugin({
            filename: "remoteEntry.js",
            name: "remote",
            exposes: {
                "./NewsList": "./src/NewsList",
            },
+            shared:{
+                react: { singleton: true },
+                "react-dom": { singleton: true }
+              }
          })
    ]
```

#### 9.4.2 host\webpack.config.js

```
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
        new ModuleFederationPlugin({
            filename: "remoteEntry.js",
            name: "host",
            remotes: {
                remote: "remote@http://localhost:3000/remoteEntry.js"
            },
+           shared:{
+                react: { singleton: true },
+                "react-dom": { singleton: true }
+           }
        })
    ]
```

### 9.5.双向依赖

- Module Federation 的共享可以是双向的

#### 9.5.1 remote\webpack.config.js

```
    plugins: [
        new HtmlWebpackPlugin({
            template:'./public/index.html'
        }),
        new ModuleFederationPlugin({
            filename: "remoteEntry.js",
            name: "remote",
+            remotes: {
+                host: "host@http://localhost:8000/remoteEntry.js"
+            },
            exposes: {
                "./NewsList": "./src/NewsList",
            },
            shared:{
                react: { singleton: true },
                "react-dom": { singleton: true }
              }
          })
    ]
```

#### 9.5.2 host\webpack.config.js

```
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
        new ModuleFederationPlugin({
            filename: "remoteEntry.js",
            name: "host",
            remotes: {
                remote: "remote@http://localhost:3000/remoteEntry.js"
            },
+           exposes: {
+                "./Slides": "./src/Slides",
+           },
            shared:{
                react: { singleton: true },
                "react-dom": { singleton: true }
              }
        })
    ]
```

#### 9.5.3 remote\src\App.js

remote\src\App.js

```
import React from "react";
import NewsList from './NewsList';
+const RemoteSlides = React.lazy(() => import("host/Slides"));
const App = () => (
  <div>
+    <h2>本地组件NewsList,远程组件Slides</h2>
    <NewsList />
+    <React.Suspense fallback="Loading Slides">
+      <RemoteSlides />
+    </React.Suspense>
  </div>
);

export default App;
```

### 9.6.多个 remote

#### 9.6.1 all\webpack.config.js

```
let path = require("path");
let webpack = require("webpack");
let HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        publicPath: "http://localhost:3000/",
    },
    devServer: {
        port: 5000
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-react"]
                    },
                },
                exclude: /node_modules/,
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template:'./public/index.html'
        }),
        new ModuleFederationPlugin({
            filename: "remoteEntry.js",
            name: "all",
            remotes: {
                remote: "remote@http://localhost:3000/remoteEntry.js",
                host: "host@http://localhost:8000/remoteEntry.js",
            },
            shared:{
                react: { singleton: true },
                "react-dom": { singleton: true }
              }
          })
    ]
}
```

#### 9.6.2 remote\src\index.js

remote\src\index.js

```
import("./bootstrap");
```

#### 9.6.3 remote\src\bootstrap.js

remote\src\bootstrap.js

```
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
ReactDOM.render(<App />, document.getElementById("root"));
```

#### 9.6.4 remote\src\App.js

remote\src\App.js

```
import React from "react";
const RemoteSlides = React.lazy(() => import("host/Slides"));
const RemoteNewsList = React.lazy(() => import("remote/NewsList"));
const App = () => (
  <div>
    <h2>远程组件Slides,远程组件NewsList</h2>
    <React.Suspense fallback="Loading Slides">
      <RemoteSlides />
    </React.Suspense>
    <React.Suspense fallback="Loading NewsList">
      <RemoteNewsList />
    </React.Suspense>
  </div>
);

export default App;
```
