## 1. plugin

- 插件向第三方开发者提供了 webpack 引擎中完整的能力。使用阶段式的构建回调，开发者可以引入它们自己的行为到 webpack 构建流程中。创建插件比创建 loader 更加高级，因为你将需要理解一些 webpack 底层的内部特性来做相应的钩子

### 1.1 为什么需要一个插件

- webpack 基础配置无法满足需求
- 插件几乎能够任意更改 webpack 编译结果
- webpack 内部也是通过大量内部插件实现的

### 1.2 可以加载插件的常用对象

| 对象           | 钩子                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| Compiler       | run,compile,compilation,make,emit,done                                              |
| Compilation    | buildModule,normalModuleLoader,succeedModule,finishModules,seal,optimize,after-seal |
| Module Factory | beforeResolver,afterResolver,module,parser Module                                   |
| Parser         | program,statement,call,expression                                                   |
| Template       | hash,bootstrap,localVars,render                                                     |

## 2. 创建插件

- 插件是一个类
- 类上有一个 apply 的实例方法
- apply 的参数是 compiler

```
class DonePlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {

    }
}
module.exports = DonePlugin;
```

## 3. Compiler 和 Compilation

- 在插件开发中最重要的两个资源就是 compiler 和 compilation 对象。理解它们的角色是扩展 webpack 引擎重要的第一步。
- compiler 对象代表了完整的 webpack 环境配置。这个对象在启动 webpack 时被一次性建立，并配置好所有可操作的设置，包括 options，loader 和 plugin。当在 webpack 环境中应用一个插件时，插件将收到此 compiler 对象的引用。可以使用它来访问 webpack 的主环境。

- compilation 对象代表了一次资源版本构建。当运行 webpack 开发环境中间件时，每当检测到一个文件变化，就会创建一个新的 compilation，从而生成一组新的编译资源。一个 compilation 对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态信息。compilation 对象也提供了很多关键时机的回调，以供插件做自定义处理时选择使用。

## 4. 基本插件架构

- 插件是由「具有 apply 方法的 prototype 对象」所实例化出来的
- 这个 apply 方法在安装插件时，会被 webpack compiler 调用一次
- apply 方法可以接收一个 webpack compiler 对象的引用，从而可以在回调函数中访问到 compiler 对象

### 4.1 使用插件代码

> [使用插件]https://github.com/webpack/webpack/blob/master/lib/webpack.js#L60-L69)

```
if (options.plugins && Array.isArray(options.plugins)) {
  for (const plugin of options.plugins) {
    plugin.apply(compiler);
  }
}
```

### 4.2 Compiler 插件

> done: new AsyncSeriesHook(["stats"])

#### 4.2.1 同步

```
class DonePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.done.tap("DonePlugin", (stats) => {
      console.log("Hello ", this.options.name);
    });
  }
}
module.exports = DonePlugin;
```

#### 4.2.2 异步

```
class DonePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.done.tapAsync("DonePlugin", (stats, callback) => {
      console.log("Hello ", this.options.name);
      callback();
    });
  }
}
module.exports = DonePlugin;
```

### 4.3 使用插件

- 要安装这个插件，只需要在你的 webpack 配置的 plugin 数组中添加一个实例

```
const DonePlugin = require("./plugins/DonePlugin");
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve("build"),
    filename: "bundle.js",
  },
  plugins: [new DonePlugin({ name: "zhufeng" })],
};
```

## 5. compilation 插件

- 使用 compiler 对象时，你可以绑定提供了编译 compilation 引用的回调函数，然后拿到每次新的 compilation 对象。这些 compilation 对象提供了一些钩子函数，来钩入到构建流程的很多步骤中

### 5.1 asset-plugin.js

> plugins\asset-plugin.js

```
class AssetPlugin{
    constructor(options){
        this.options = options;
    }
    apply(compiler){
        //监听compilation事件
        //https://webpack.docschina.org/api/compiler-hooks/#compilation
        compiler.hooks.compilation.tap('AssetPlugin',(compilation)=>{
            //https://webpack.docschina.org/api/compilation-hooks/#chunkasset
            //一个 chunk 中的一个 asset 被添加到 compilation 时调用
            //一个代码块会生成一个文件(asset) 文件肯定有文件名 filename
            compilation.hooks.chunkAsset.tap('AssetPlugin',(chunk,filename)=>{
                //
                console.log(chunk.name||chunk.id,filename);
            });
        });
    }
}
module.exports = AssetPlugin;
```

## 6. 打包 zip

> webpack-sources

### 6.1 archive-plugin.js

> plugins\archive-plugin.js

```
const Jszip = require('jszip');
const path = require('path');
class ArchivePlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        compiler.hooks.emit.tapPromise('ArchivePlugin',(compilation)=>{
            let jszip = new Jszip();
            //assets对象 key文件名 值文件的内容，它里面存放着所有将要输出到目录目录里的文件
            let assets = compilation.assets;
            for(let filename in assets){
                const source = assets[filename].source();
                jszip.file(filename,source);
            }
            return jszip.generateAsync({type:'nodebuffer'}).then(content=>{
                let filename = this.options.filename.replace('[timestamp]',Date.now()+'');
                assets[filename]={
                    source(){
                        return content;
                    }
                }
            });
        });
    }
}
module.exports = ArchivePlugin;
```

### 6.2 webpack.config.js

webpack.config.js

```
const ArchivePlugin = require('./plugins/archive-plugin');
  plugins: [
+   new ArchivePlugin({
+     filename:'[timestamp].zip'
+   })
]
```

## 7.自动外链

### 7.1 使用外部类库

- 手动指定 external
- 手动引入 script
  > 能否检测代码中的 import 自动处理这个步骤?

```
{
  externals:{
    //key jquery是要require或import 的模块名,值 jQuery是一个全局变量名
  'jquery':'$'
},
  module:{}
}
```

### 7.2 思路

- 解决 import 自动处理 external 和 script 的问题，需要怎么实现，该从哪方面开始考虑
- 依赖 当检测到有 import 该 library 时，将其设置为不打包类似 exteral,并在指定模版中加入 script,那么如何检测 import？这里就用 Parser
- external 依赖 需要了解 external 是如何实现的，webpack 的 external 是通过插件 ExternalsPlugin 实现的，ExternalsPlugin 通过 tap NormalModuleFactory 在每次创建 Module 的时候判断是否是 ExternalModule
- webpack4 加入了模块类型之后，Parser 获取需要指定类型 moduleType,一般使用 javascript/auto 即可

### 7.3 使用 plugins

```
plugins: [
  new HtmlWebpackPlugin({
            template:'./src/index.html'
  }),
  new AutoExternalPlugin({
      jquery:{//自动把jquery模块变成一个外部依赖模块
          variable:'jQuery',//不再打包，而是从window.jQuery变量上获取jquery对象
          url:'https://cdn.bootcss.com/jquery/3.1.0/jquery.js'//CDN脚本
      },
      lodash:{//自动把jquery模块变成一个外部依赖模块
          variable:'_',//不再打包，而是从window.jQuery变量上获取jquery对象
          url:'https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.js'//CDN脚本
      }
  })
];
```

### 7.4 AutoExternalPlugin

- ExternalsPlugin.js
- ExternalModuleFactoryPlugin
- ExternalModule.js
- parser
- factory
- htmlWebpackPluginAlterAssetTags
  AsyncSeriesBailHook factorize

```
let { AsyncSeriesBailHook } = require("tapable");
let factorize = new AsyncSeriesBailHook(["resolveData"]);
factorize.tapAsync("tap1", (resolveData, callback) => {
    if (resolveData === "jquery") {
        callback(null, { externalModule: "jquery" });
    } else {
        callback();
    }
});
factorize.tapAsync("tap2", (resolveData, callback) => {
    callback(null, { normalModule: resolveData });
});
//由tap1返回
factorize.callAsync("jquery", (err, module) => {
    console.log(module);
});
//由tap2返回
factorize.callAsync("jquery2", (err, module) => {
    console.log(module);
});
```

plugins\auto-external-plugin.js

```
const { ExternalModule } = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * 1.需要向输出html文件中添加CDN脚本引用
 * 2.在打包生产模块的时候，截断正常的打包逻辑，变成外部依赖模块
 */
class AutoExternalPlugin{
    constructor(options){
        this.options = options;
        this.externalModules = Object.keys(this.options);//['jquery'] 进行自动外键的模块
        this.importedModules = new Set();//存放着所有的实际真正使用到的外部依赖模块
    }
    apply(compiler){
        //每种模块会对应一个模块工厂 普通模块对应的就是普通模块工厂
        //https://webpack.docschina.org/api/normalmodulefactory-hooks/
        compiler.hooks.normalModuleFactory.tap('AutoExternalPlugin',(normalModuleFactory)=>{
            //https://webpack.docschina.org/api/parser/#root
            normalModuleFactory.hooks.parser
            .for('javascript/auto')//普通 的JS文件对应的钩子就是'javascript/auto'
            .tap('AutoExternalPlugin',parser=>{
                //在parser遍历语法的过程中，如果遍历到了import节点
                //https://webpack.docschina.org/api/parser/#import
                parser.hooks.import.tap('AutoExternalPlugin',(statement,source)=>{
                    if(this.externalModules.includes(source)){
                        this.importedModules.add(source);
                    }
                });
                //https://webpack.docschina.org/api/parser/#call
                //call=HookMap key方法名 值是这个方法对应的钩子
                parser.hooks.call.for('require').tap('AutoExternalPlugin',(expression)=>{
                    let value = expression.arguments[0].value;
                    if(this.externalModules.includes(value)){
                        this.importedModules.add(value);
                    }
                });
            })
            //2.改造模块的生产过程，如果是外链模块，就直接生产一个外链模块返回
            //https://webpack.docschina.org/api/normalmodulefactory-hooks/
            normalModuleFactory.hooks.factorize.tapAsync('AutoExternalPlugin',(resolveData,callback)=>{
                let {request} = resolveData;//模块名 jquery lodash
                if(this.externalModules.includes(request)){
                    let {variable} = this.options[request];
                    //request=jquery window.jQuery
                    callback(null,new ExternalModule(variable,'window',request));
                }else{
                    callback(null);//如果是正常模块，直接向后执行。走正常的打包模块的流程
                }
            });
        });
        //是往输出的HTML中添加一个新的CDN Script标签
        compiler.hooks.compilation.tap('AutoExternalPlugin',(compilation)=>{
            HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync('AutoExternalPlugin',(htmlData,callback)=>{
                //console.log(JSON.stringify(htmlData,null,2));
                Reflect.ownKeys(this.options).filter(key=>this.importedModules.has(key)).forEach(key=>{
                    //jquery
                    htmlData.assetTags.scripts.unshift({
                        tagName:'script',
                        voidTag:false,
                        attributes:{
                            defer:false,
                            src:this.options[key].url
                        }
                    });
                })
                callback(null,htmlData);
            });
        });

    }
}
module.exports = AutoExternalPlugin;

/**
 * Node {
  type: 'ImportDeclaration',
  start: 0,
  end: 23,
  loc: SourceLocation {
    start: Position { line: 1, column: 0 },
    end: Position { line: 1, column: 23 }
  },
  range: [ 0, 23 ],
  specifiers: [
    Node {
      type: 'ImportDefaultSpecifier',
      start: 7,
      end: 8,
      loc: [SourceLocation],
      range: [Array],
      local: [Node]
    }
  ],
  source: Node {
    type: 'Literal',
    start: 14,
    end: 22,
    loc: SourceLocation { start: [Position], end: [Position] },
    range: [ 14, 22 ],
    value: 'jquery',
    raw: "'jquery'"
  }
}
jquery
 */
```

## 8.HashPlugin

- 可以自己修改各种 hash 值

```
class HashPlugin{
    constructor(options){
        this.options = options;
    }
    apply(compiler){
        compiler.hooks.compilation.tap('HashPlugin',(compilation,params)=>{
            //如果你想改变hash值，可以在hash生成这后修改
            compilation.hooks.afterHash.tap('HashPlugin',()=>{
                let fullhash = 'fullhash';//时间戳
                console.log('本次编译的compilation.hash',compilation.hash);
                compilation.hash= fullhash;//output.filename [fullhash]
                for(let chunk of compilation.chunks){
                    console.log('chunk.hash',chunk.hash);
                    chunk.renderedHash = 'chunkHash';//可以改变chunkhash
                    console.log('chunk.contentHash',chunk.contentHash);
                    chunk.contentHash= { javascript: 'javascriptContentHash','css/mini-extract':'cssContentHash' }
                }
            });
        });
    }
}
module.exports = HashPlugin;
/**
 * 三种hash
 * 1. hash compilation.hash
 * 2. chunkHash 每个chunk都会有一个hash
 * 3. contentHash 内容hash 每个文件会可能有一个hash值
 */
```

webpack.config.js

```
const path = require('path');
const DonePlugin = require('./plugins/DonePlugin');
const AssetPlugin = require('./plugins/AssetPlugin');
const ZipPlugin = require('./plugins/ZipPlugin');
const HashPlugin = require('./plugins/HashPlugin');
const AutoExternalPlugin = require('./plugins/AutoExternalPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
+                   MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
+       new HashPlugin(),
    ]
}
```

## 9.AsyncQueue

### 9.1 AsyncQueue

```
let AsyncQueue = require('webpack/lib/util/AsyncQueue');
let AsyncQueue = require('./AsyncQueue');
function processor(item, callback) {
    setTimeout(() => {
        console.log('process',item);
        callback(null, item);
    }, 3000);
}
const getKey = (item) => {
    return item.key;
}
let queue  = new AsyncQueue({
    name:'createModule',parallelism:3,processor,getKey
});
const start = Date.now();
let item1 = {key:'module1'};
queue.add(item1,(err,result)=>{
    console.log(err,result);
    console.log(Date.now() - start);
});
queue.add(item1,(err,result)=>{
    console.log(err,result);
    console.log(Date.now() - start);
});
queue.add({key:'module2'},(err,result)=>{
    console.log(err,result);
    console.log(Date.now() - start);
});
queue.add({key:'module3'},(err,result)=>{
    console.log(err,result);
    console.log(Date.now() - start);
});
queue.add({key:'module4'},(err,result)=>{
    console.log(err,result);
    console.log(Date.now() - start);
});
```

### 9.2 use.js

use.js

```
const QUEUED_STATE = 0;//已经 入队，待执行
const PROCESSING_STATE = 1;//处理中
const DONE_STATE = 2;//处理完成
class ArrayQueue {
    constructor() {
        this._list = [];
    }
    enqueue(item) {
        this._list.push(item);//[1,2,3]
    }
    dequeue() {
        return this._list.shift();//移除并返回数组中的第一个元素
    }
}
class AsyncQueueEntry {
    constructor(item, callback) {
        this.item = item;//任务的描述
        this.state = QUEUED_STATE;//这个条目当前的状态
        this.callback = callback;//任务完成的回调
    }
}
class AsyncQueue {
    constructor({ name, parallelism, processor, getKey }) {
        this._name = name;//队列的名字
        this._parallelism = parallelism;//并发执行的任务数
        this._processor = processor;//针对队列中的每个条目执行什么操作
        this._getKey = getKey;//函数，返回一个key用来唯一标识每个元素
        this._entries = new Map();
        this._queued = new ArrayQueue();//将要执行的任务数组队列
        this._activeTasks = 0;//当前正在执行的数，默认值1
        this._willEnsureProcessing = false;//是否将要开始处理
    }
    add = (item, callback) => {
        const key = this._getKey(item);//获取这个条目对应的key
        const entry = this._entries.get(key);//获取 这个key对应的老的条目
        if (entry !== undefined) {
            if (entry.state === DONE_STATE) {
                process.nextTick(() => callback(entry.error, entry.result));
            } else if (entry.callbacks === undefined) {
                entry.callbacks = [callback];
            } else {
                entry.callbacks.push(callback);
            }
            return;
        }
        const newEntry = new AsyncQueueEntry(item, callback);//创建一个新的条目
        this._entries.set(key, newEntry);//放到_entries
        this._queued.enqueue(newEntry);//把这个新条目放放队列
        if (this._willEnsureProcessing === false) {
            this._willEnsureProcessing = true;
            setImmediate(this._ensureProcessing);
        }
    }
    _ensureProcessing = () => {
        //如果当前的激活的或者 说正在执行任务数行小于并发数
        while (this._activeTasks < this._parallelism) {
            const entry = this._queued.dequeue();//出队 先入先出
            if (entry === undefined) break;
            this._activeTasks++;//先让正在执行的任务数++
            entry.state = PROCESSING_STATE;//条目的状态设置为执行中
            this._startProcessing(entry);
        }
        this._willEnsureProcessing = false;
    }
    _startProcessing = (entry) => {
        this._processor(entry.item, (e, r) => {
            this._handleResult(entry, e, r);
        });
    }
    _handleResult = (entry, error, result) => {
        const callback = entry.callback;
        const callbacks = entry.callbacks;
        entry.state = DONE_STATE;//把条目的状态设置为已经完成
        entry.callback = undefined;//把callback
        entry.callbacks = undefined;
        entry.result = result;//把结果赋给entry
        entry.error = error;//把错误对象赋给entry
        callback(error, result);
        if (callbacks !== undefined) {
            for (const callback of callbacks) {
                callback(error, result);
            }
        }
        this._activeTasks--;
        if (this._willEnsureProcessing === false) {
            this._willEnsureProcessing = true;
            setImmediate(this._ensureProcessing);
        }
    }
}
module.exports = AsyncQueue;
```
