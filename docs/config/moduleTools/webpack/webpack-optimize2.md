## 1. purgecss-webpack-plugin

- purgecss-webpack-plugin
- mini-css-extract-plugin
- purgecss
- 可以去除未使用的 css，一般与 glob、glob-all 配合使用
- 必须和 mini-css-extract-plugin 配合使用
- paths 路径是绝对路径

```
npm i  purgecss-webpack-plugin mini-css-extract-plugin css-loader glob -D
```

webpack.config.js

```
const path = require("path");
+const glob = require("glob");
+const PurgecssPlugin = require("purgecss-webpack-plugin");
+const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PATHS = {
  src: path.join(__dirname, 'src')
}
module.exports = {
  mode: "development",
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        ],
      },
+      {
+        test: /\.css$/,
+        include: path.resolve(__dirname, "src"),
+        exclude: /node_modules/,
+        use: [
+          {
+            loader: MiniCssExtractPlugin.loader,
+          },
+          "css-loader",
+        ],
+      },
    ],
  },
  plugins: [
+    new MiniCssExtractPlugin({
+      filename: "[name].css",
+    }),
+    new PurgecssPlugin({
+      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
+    })
  ],
};
```

style.css

```
#root{
    color: red;
}
#logo{
    color:green
}
```

## 2. thread-loader

- 把这个 loader 放置在其他 loader 之前， 放置在这个 loader 之后的 loader 就会在一个单独的 worker 池(worker pool)中运行
  thread-loader

```
npm  i thread-loader- D
const path = require("path");
const glob = require("glob");
const PurgecssPlugin = require("purgecss-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DllReferencePlugin = require("webpack/lib/DllReferencePlugin.js");
const PATHS = {
  src: path.join(__dirname, 'src')
}
module.exports = {
  mode: "development",
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, "src"),
        use: [
+          {
+            loader:'thread-loader',
+            options:{
+              workers:3
+            }
+          },
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
    }),
    new DllReferencePlugin({
      manifest: require("./dist/react.manifest.json"),
    }),
  ],
};
```

## 3. CDN

- qiniu
- CDN 又叫内容分发网络，通过把资源部署到世界各地，用户在访问时按照就近原则从离用户最近的服务器获取资源，从而加速资源的获取速度

![cmd-markdown-logo](http://img.zhufengpeixun.cn/cdn2.jpg)

### 3.1 使用缓存

- HTML 文件不缓存，放在自己的服务器上，关闭自己服务器的缓存，静态资源的 URL 变成指向 CDN 服务器的地址
- 静态的 JavaScript、CSS、图片等文件开启 CDN 和缓存，并且文件名带上 HASH 值
- 为了并行加载不阻塞，把不同的静态资源分配到不同的 CDN 服务器上

### 3.2 域名限制

- 同一时刻针对同一个域名的资源并行请求是有限制
- 可以把这些静态资源分散到不同的 CDN 服务上去
- 多个域名后会增加域名解析时间
- 可以通过在 HTML HEAD 标签中 加入<link rel="dns-prefetch" href="http://img.zhufengpeixun.cn">去预解析域名，以降低域名解析带来的延迟

### 3.3 文件指纹

- 打包后输出的文件名和后缀
- hash 一般是结合 CDN 缓存来使用，通过 webpack 构建之后，生成对应文件名自动带上对应的 MD5 值。如果文件内容改变的话，那么对应文件哈希值也会改变，对应的 HTML 引用的 URL 地址也会改变，触发 CDN 服务器从源服务器上拉取对应数据，进而更新本地缓存。
- 指纹占位符

| 占位符名称  | 含义                                                          |
| ----------- | ------------------------------------------------------------- |
| ext         | 资源后缀名                                                    |
| name        | 文件名称                                                      |
| path        | 文件的相对路径                                                |
| folder      | 文件所在的文件夹                                              |
| hash        | 每次 webpack 构建时生成一个唯一的 hash 值                     |
| chunkhash   | 根据 chunk 生成 hash 值，来源于同一个 chunk，则 hash 值就一样 |
| contenthash | 根据内容生成 hash 值，文件内容相同 hash 值就相同              |

#### 3.3.1 hash

- Hash 是整个项目的 hash 值，其根据每次编译内容计算得到，每次编译之后都会生成新的 hash,即修改任何文件都会导致所有文件的 hash 发生改变

```
const path = require("path");
const glob = require("glob");
const PurgecssPlugin = require("purgecss-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PATHS = {
  src: path.join(__dirname, 'src')
}
module.exports = {
  mode: "production",
+  entry: {
+    main: './src/index.js',
+    vender:['lodash']
+  },
  output:{
    path:path.resolve(__dirname,'dist'),
+    filename:'[name].[hash].js'
  },
  devServer:{
    hot:false
  },
  module: {
    rules: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader:'thread-loader',
            options:{
              workers:3
            }
          },
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
+      filename: "[name].[hash].css"
    }),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
    }),
  ],
};
```

#### 3.3.2 chunkhash

- chunkhash 采用 hash 计算的话，每一次构建后生成的哈希值都不一样，即使文件内容压根没有改变。这样子是没办法实现缓存效果，我们需要换另一种哈希值计算方式，即 chunkhash,chunkhash 和 hash 不一样，它根据不同的入口文件(Entry)进行依赖文件解析、构建对应的 chunk，生成对应的哈希值。我们在生产环境里把一些公共库和程序入口文件区分开，单独打包构建，接着我们采用 chunkhash 的方式生成哈希值，那么只要我们不改动公共库的代码，就可以保证其哈希值不会受影响

```
const path = require("path");
const glob = require("glob");
const PurgecssPlugin = require("purgecss-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PATHS = {
  src: path.join(__dirname, 'src')
}
module.exports = {
  mode: "production",
  entry: {
    main: './src/index.js',
    vender:['lodash']
  },
  output:{
    path:path.resolve(__dirname,'dist'),
+    filename:'[name].[chunkhash].js'
  },
  devServer:{
    hot:false
  },
  module: {
    rules: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader:'thread-loader',
            options:{
              workers:3
            }
          },
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
+      filename: "[name].[chunkhash].css"
    }),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
    }),
  ],
};
```

#### 3.3.3 contenthash

- 使用 chunkhash 存在一个问题，就是当在一个 JS 文件中引入 CSS 文件，编译后它们的 hash 是相同的，而且只要 js 文件发生改变 ，关联的 css 文件 hash 也会改变,这个时候可以使用 mini-css-extract-plugin 里的 contenthash 值，保证即使 css 文件所处的模块里就算其他文件内容改变，只要 css 文件内容不变，那么不会重复构建

```
const path = require("path");
const glob = require("glob");
const PurgecssPlugin = require("purgecss-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PATHS = {
  src: path.join(__dirname, 'src')
}
module.exports = {
  mode: "production",
  entry: {
    main: './src/index.js',
    vender:['lodash']
  },
  output:{
    path:path.resolve(__dirname,'dist'),
    filename:'[name].[chunkhash].js'
  },
  devServer:{
    hot:false
  },
  module: {
    rules: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader:'thread-loader',
            options:{
              workers:3
            }
          },
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
+      filename: "[name].[contenthash].css"
    }),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
    }),
  ],
};
```

#### 3.3.4 hash

![cmd-markdown-logo](https://img.zhufengpeixun.com/variableHash.jpg)

```
function createHash(){
   return  require('crypto').createHash('md5');
}
let entry = {
    entry1:'entry1',
    entry2:'entry2'
}
let entry1 = 'require depModule1';//模块entry1
let entry2 = 'require depModule2';//模块entry2

let depModule1 = 'depModule1';//模块depModule1
let depModule2 = 'depModule2';//模块depModule2
//如果都使用hash的话，因为这是工程级别的，即每次修改任何一个文件，所有文件名的hash至都将改变。所以一旦修改了任何一个文件，整个项目的文件缓存都将失效
let hash =  createHash()
.update(entry1)
.update(entry2)
.update(depModule1)
.update(depModule2)
.digest('hex');
console.log('hash',hash)
//chunkhash根据不同的入口文件(Entry)进行依赖文件解析、构建对应的chunk，生成对应的哈希值。
//在生产环境里把一些公共库和程序入口文件区分开，单独打包构建，接着我们采用chunkhash的方式生成哈希值，那么只要我们不改动公共库的代码，就可以保证其哈希值不会受影响
let entry1ChunkHash = createHash()
.update(entry1)
.update(depModule1).digest('hex');;
console.log('entry1ChunkHash',entry1ChunkHash);

let entry2ChunkHash = createHash()
.update(entry2)
.update(depModule2).digest('hex');;
console.log('entry2ChunkHash',entry2ChunkHash);

let entry1File = entry1+depModule1;
let entry1ContentHash = createHash()
.update(entry1File).digest('hex');;
console.log('entry1ContentHash',entry1ContentHash);

let entry2File = entry2+depModule2;
let entry2ContentHash = createHash()
.update(entry2File).digest('hex');;
console.log('entry2ContentHash',entry2ContentHash);
```

## 4.Tree Shaking

- 一个模块可以有多个方法，只要其中某个方法使用到了，则整个文件都会被打到 bundle 里面去，tree shaking 就是只把用到的方法打入 bundle,没用到的方法会 uglify 阶段擦除掉
- 原理是利用 es6 模块的特点,只能作为模块顶层语句出现,import 的模块名只能是字符串常量

### 4.1 开启

- webpack 默认支持，在.babelrc 里设置 module:false 即可在 production mode 下默认开启
- 还要注意把 devtool 设置为 null 在 package.json 中配置：
- "sideEffects": false 所有的代码都没有副作用（都可以进行 tree shaking）
- 可能会把 css / @babel/polyfill 文件干掉 可以设置"sideEffects":["*.css"]
  webpack.config.js

```
const path = require("path");
const glob = require("glob");
const PurgecssPlugin = require("purgecss-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PATHS = {
  src: path.join(__dirname, 'src')
}
module.exports = {
+  mode: "production",
+  devtool:false,
  entry: {
    main: './src/index.js'
  },
  output:{
    path:path.resolve(__dirname,'dist'),
    filename:'[name].[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader:'thread-loader',
            options:{
              workers:3
            }
          },
          {
            loader: "babel-loader",
            options: {
+              presets: [["@babel/preset-env",{"modules":false}], "@babel/preset-react"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css"
    }),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
    }),
  ],
};
```

### 4.2 没有导入和使用

functions.js

```
function func1(){
  return 'func1';
}
function func2(){
     return 'func2';
}
export {
  func1,
  func2
}
import {func2} from './functions';
var result2 = func2();
console.log(result2);
```

### 4.3 代码不会被执行，不可到达

```
if(false){
 console.log('false')
}
```

### 4.4 代码执行的结果不会被用到

```
import {func2} from './functions';
func2();
```

### 4.5 代码中只写不读的变量

```
var aabbcc='aabbcc';
aabbcc='eeffgg';
```

## 5. 代码分割

- 对于大的 Web 应用来讲，将所有的代码都放在一个文件中显然是不够有效的，特别是当你的某些代码块是在某些特殊的时候才会被用到。
- webpack 有一个功能就是将你的代码库分割成 chunks 语块，当代码运行到需要它们的时候再进行加载

### 5.1 入口点分割

- Entry Points：入口文件设置的时候可以配置
- 这种方法的问题
  > 如果入口 chunks 之间包含重复的模块(lodash)，那些重复模块都会被引入到各个 bundle 中
  > 不够灵活，并且不能将核心应用程序逻辑进行动态拆分代码

```
{
  entry: {
   page1: "./src/page1.js",
   page2: "./src/page2.js"
  }
}
```

### 5.2 动态导入和懒加载

- 用户当前需要用什么功能就只加载这个功能对应的代码，也就是所谓的按需加载 在给单页应用做按需加载优化时
- 一般采用以下原则：
- 对网站功能进行划分，每一类一个 chunk
- 对于首次打开页面需要的功能直接加载，尽快展示给用户,某些依赖大量代码的功能点可以按需加载
- 被分割出去的代码需要一个按需加载的时机

### 5.2.1 hello.js

hello.js

```
module.exports = "hello";
index.js

document.querySelector('#clickBtn').addEventListener('click',() => {
    import('./hello').then(result => {
        console.log(result.default);
    });
});
```

index.html

```
<button id="clickBtn">点我</button>
```

#### 5.2.2 preload(预先加载)

- preload 通常用于本页面要用到的关键资源，包括关键 js、字体、css 文件
- preload 将会把资源得下载顺序权重提高，使得关键数据提前下载好,优化页面打开速度
- 在资源上添加预先加载的注释，你指明该模块需要立即被使用
- 一个资源的加载的优先级被分为五个级别,分别是
  - Highest 最高
  - High 高
  - Medium 中等
  - Low 低
  - Lowest 最低
- 异步/延迟/插入的脚本（无论在什么位置）在网络优先级中是 Low
- @vue/preload-webpack-plugin
- preload-webpack-plugin npm

```
npm install --save-dev @vue/preload-webpack-plugin
```

![cmd-markdown-logo](http://img.zhufengpeixun.cn/prefetchpreload.png)

```
<link rel="preload" as="script" href="utils.js">
```

```
import(
  `./utils.js`
  /* webpackPreload: true */
  /* webpackChunkName: "utils" */
)
```

#### 5.2.3 prefetch(预先拉取)

- prefetch 跟 preload 不同，它的作用是告诉浏览器未来可能会使用到的某个资源，浏览器就会在闲时去加载对应的资源，若能预测到用户的行为，比如懒加载，点击到其它页面等则相当于提前预加载了需要的资源

```
<link rel="prefetch" href="utils.js" as="script">
button.addEventListener('click', () => {
  import(
    `./utils.js`
    /* webpackPrefetch: true */
    /* webpackChunkName: "utils" */
  ).then(result => {
    result.default.log('hello');
  })
});
```

#### 5.2.4 preload vs prefetch

- preload 是告诉浏览器页面必定需要的资源，浏览器一定会加载这些资源
- 而 prefetch 是告诉浏览器页面可能需要的资源，浏览器不一定会加载这些资源
- 所以建议：对于当前页面很有必要的资源使用 preload,对于可能在将来的页面中使用的资源使用 prefetch

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="prefetch" href="prefetch.js?k=1" as="script">
    <link rel="prefetch" href="prefetch.js?k=2" as="script">
    <link rel="prefetch" href="prefetch.js?k=3" as="script">
    <link rel="prefetch" href="prefetch.js?k=4" as="script">
    <link rel="prefetch" href="prefetch.js?k=5" as="script">

</head>
<body>

</body>
<link rel="preload"  href="preload.js" as="script">
</html>
```

### 5.3 提取公共代码

- split-chunks-plugin
- common-chunk-and-vendor-chunk

- 怎么配置单页应用?怎么配置多页应用?

#### 5.3.1 为什么需要提取公共代码

- 大网站有多个页面，每个页面由于采用相同技术栈和样式代码，会包含很多公共代码，如果都包含进来会有问题
- 相同的资源被重复的加载，浪费用户的流量和服务器的成本；
- 每个页面需要加载的资源太大，导致网页首屏加载缓慢，影响用户体验。
- 如果能把公共代码抽离成单独文件进行加载能进行优化，可以减少网络传输流量，降低服务器成本

#### 5.3.2 如何提取

- 基础类库，方便长期缓存
- 页面之间的公用代码
- 各个页面单独生成文件

#### 5.3.3 module chunk bundle

- module：就是 js 的模块化 webpack 支持 commonJS、ES6 等模块化规范，简单来说就是你通过 import 语句引入的代码
- chunk: chunk 是 webpack 根据功能拆分出来的，包含三种情况
- 你的项目入口（entry）
- 通过 import()动态引入的代码
- 通过 splitChunks 拆分出来的代码
- bundle：bundle 是 webpack 打包之后的各个文件，一般就是和 chunk 是一对一的关系，bundle 就是对 chunk 进行编译压缩打包等处理之后的产出

#### 5.3.4 splitChunks

split-chunks-plugin
![cmd-markdown-logo](http://img.zhufengpeixun.com/splitChunks.jpg)

##### 5.3.4.1 webpack.config.js

```
const HtmlWebpackPlugin = require('html-webpack-plugin');
{
  entry: {
    page1: "./src/page1.js",
    page2: "./src/page2.js",
    page3: "./src/page3.js",
  },
  optimization: {
        splitChunks: {
            // 表示选择哪些 chunks 进行分割，可选值有：async，initial和all
            chunks: 'all',
            // 表示新分离出的chunk必须大于等于minSize，默认为30000，约30kb。
            minSize: 0,//默认值是20000,生成的代码块的最小尺寸
            // 表示一个模块至少应被minChunks个chunk所包含才能分割。默认为1。
            minChunks: 1,
            // 表示按需加载文件时，并行请求的最大数目。默认为5。
            maxAsyncRequests: 3,
            // 表示加载入口文件时，并行请求的最大数目。默认为3
            maxInitialRequests: 5,
            // 表示拆分出的chunk的名称连接符。默认为~。如chunk~vendors.js
            automaticNameDelimiter: '~',
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/, //条件
                    priority: -10 ///优先级，一个chunk很可能满足多个缓存组，会被抽取到优先级高的缓存组中,为了能够让自定义缓存组有更高的优先级(默认0),默认缓存组的priority属性为负值.
                },
                default: {
                    minChunks: 2,////被多少模块共享,在分割之前模块的被引用次数
                    priority: -20
                },
            },
        },
        runtimeChunk:true
  },
  plugins:[
        new HtmlWebpackPlugin({
                template:'./src/index.html',
                chunks:["page1"],
                filename:'page1.html'
        }),
        new HtmlWebpackPlugin({
            template:'./src/index.html',
            chunks:["page2"],
            filename:'page2.html'
    }),
    new HtmlWebpackPlugin({
            template:'./src/index.html',
            chunks:["page3"],
            filename:'page3.html'
    })
    ]
    }
```

###### 5.3.4.2 src\page1.js

```
import module1 from "./module1";
import module2 from "./module2";
import $ from "jquery";
console.log(module1, module2, $);
import(/* webpackChunkName: "asyncModule1" */ "./asyncModule1");
```

##### 5.3.4.3 src\page2.js

```
import module1 from "./module1";
import module2 from "./module2";
import $ from "jquery";
console.log(module1, module2, $);
```

##### 5.3.4.4 src\page3.js

```
import module1 from "./module1";
import module3 from "./module3";
import $ from "jquery";
console.log(module1, module3, $);
```

##### 5.3.4.5 src\module1.js

```
console.log("module1");
```

###### 5.3.4.6 src\module2.js

```
console.log("module2");
```

###### 5.3.4.7 src\module3.js

```
console.log("module3");
```

###### 5.3.4.8 src\asyncModule1.js

```
import _ from 'lodash';
console.log(_);
```

- 打包后的结果

```
defaultVendors-node_modules_lodash_lodash_js.js
defaultVendors-node_modules_jquery_dist_jquery_js.js
default-src_module1_js.js
default-src_module2_js.js
page1.js
page2.js
page3.js
asyncModule1.js
runtime~page1.js
runtime~page2.js
runtime~page3.js
```

```
let page1Chunk= {
    name:'page1',
    modules:['A','B','C','lodash']
}

let page2Chunk = {
    name:'page2',
    module:['C','D','E','lodash']
}

let  cacheGroups= {
    vendor: {
      test: /lodash/,
    },
    default: {
      minChunks: 2,
    }
};

let vendorChunk = {
    name:`vendor~node_modules_lodash_js`,
    modules:['lodash']
}
let defaultChunk = {
    name:`default~page1~page2`,
    modules:['C']
}
```

#### 5.3.5 reuseExistingChunk

如果当前的代码包含已经被从主 bundle 中分割出去的模块，它将会被重用，而不会生成一个新的代码块

##### 5.3.5.1 index.js

##### 5.3.5.2 webpack.config.js

```
{
  cacheGroups:{
     defaultVendors:false,
     default:false,
     common:{
         minChunks: 1,
         reuseExistingChunk:false
    }
  }
}
```

## 6.开启 Scope Hoisting

- Scope Hoisting 可以让 Webpack 打包出来的代码文件更小、运行的更快， 它又译作 "作用域提升"，是在 Webpack3 中新推出的功能。
- 初 webpack 转换后的模块会包裹上一层函数,import 会转换成 require
- 代码体积更小，因为函数申明语句会产生大量代码
- 代码在运行时因为创建的函数作用域更少了，内存开销也随之变小
- 大量作用域包裹代码会导致体积增大
- 运行时创建的函数作用域变多，内存开销增大
- scope hoisting 的原理是将所有的模块按照引用顺序放在一个函数作用域里，然后适当地重命名一些变量以防止命名冲突
- 这个功能在 mode 为 production 下默认开启,开发环境要用 webpack.optimize.ModuleConcatenationPlugin 插件
- 也要使用 ES6 Module,CJS 不支持
  hello.js

```
export default 'Hello';
```

index.js

```
import str from './hello.js';
console.log(str);
```

输出的结果 main.js

```
"./src/index.js":
(function(module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
var hello = ('hello');
console.log(hello);
 })
```

函数由两个变成了一个，hello.js 中定义的内容被直接注入到了 main.js 中

## 7.利用缓存

- webpack 中利用缓存一般有以下几种思路：
- babel-loader 开启缓存
- 使用 cache-loader

### 7.1 babel-loader

- Babel 在转义 js 文件过程中消耗性能较高，将 babel-loader 执行的结果缓存起来，当重新打包构建时会尝试读取缓存，从而提高打包构建速度、降低消耗

```
 {
    test: /\.js$/,
    exclude: /node_modules/,
    use: [{
      loader: "babel-loader",
      options: {
        cacheDirectory: true
      }
    }]
  },
```

### 7.2 cache-loader

- 在一些性能开销较大的 loader 之前添加此 loader,以将结果缓存到磁盘里
- 存和读取这些缓存文件会有一些时间开销,所以请只对性能开销较大的 loader 使用此 loader

```
npm i  cache-loader -D
```

```
const loaders = ['babel-loader'];
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'cache-loader',
          ...loaders
        ],
        include: path.resolve('src')
      }
    ]
  }
}
```

### 7.3 oneOf

- 每个文件对于 rules 中的所有规则都会遍历一遍，如果使用 oneOf 就可以解决该问题，只要能匹配一个即可退出。(注意：在 oneOf 中不能两个配置处理同一种类型文件)

```
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        //优先执行
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
          fix: true
        }
      },
      {
        // 以下 loader 只会匹配一个
        oneOf: [
          ...,
          {},
          {}
        ]
      }
    ]
  }
}
```
