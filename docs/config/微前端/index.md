### 一、为什么需要微前端

微前端就是将不同的功能按照不同的维度拆分成多个子应用，通过住应用来加载这些子应用，微前端的核心在于拆，拆完后再合

### 为什么去使用它

- 不同的团队间开发同一个应用技术栈不同
- 希望每个团队都可以独立的开发，独立部署
- 项目中还需要老的应用代码
  我们是不是可以将应用划分成若干个子应用，将子应用打包成一个个 lib，当路径切换时加载不同的子应用，这样每个子应用都是独立的，技术栈也不用做限制
  从而解决了协同开发的问题

#### 怎么样落地微前端

2018 年 single spa 诞生了，它是一个用于前端微服务的 javascript 前端解决方案，本身没有处理样式隔离，js 隔离，实现了路由劫持和应用加载
2019 年，qiankun 基于 single spa 提供了更加开箱即用的 api，做到了与技术栈无关并且接入简单，像 iframe 一样简单

> 总结： 子应用可以独立加载，运行时动态加载子应用完全解藕，技术栈无关，靠的是协议接入（子应用必须到处 bootstrap，mount, unmount）方法

### 为什么不用 iframe？

- 如果使用 iframe，iframe 中的子应用路由切换时用户刷新页面，状态就没了
  应用通信
- 基于 URL 进行数据传递，但是传递消息能力弱
- 基于 CustomEvent 实现通信
- 基于 props 主子应用间通信
- 使用全局变量，redux 进行通信
  公共依赖
- CDN-externals
- webpack 模块联邦

## 二、 Single-SPA 的缺陷

- 不够灵活，不能动态的加载 js 文件
- 样式不隔离，没有 js 沙箱机制

```
registerApplication('myVueApp', asycn()=>{
    await loadScript('http://localhost:8080/chunk-vendor.js')
    return window.singleVue; // bootstrap mount unmount
})
```

## 三、样式隔离

### 子应用之间的样式隔离

- Dynamic Stylesheet 动态样式表，当应用切换时移除老样式，添加新应用样式

### 主应用和子应用之间的样式隔离

- BEM(block Element Modifier)约定项目前缀
- css-Modules 打包时生成不冲突的选择缀名
- shadow Dom 真正意义上的隔离
- css-in-js

#### shadow Dom

```
<html>
    <body>
        <div>
            <p>hello world</p>
            <div id='shadow'></div>
        </div>
        <script>
            let shadowDom = document.getElementById('shadow')；
            attachShadow({mode:'closed'}); // 外界无法访问shadow dom
            let pElm = document.createElement('p');
            pElm.innerHTML = 'hello world';
            let styleElm = document.createElement('style');
            styleElm.textContent = 'p{color:red}';
            shadowDom.appendChild(styleElm);
            shadowDom.appendChild(pElm);
            document.body.appendChild(pElm);
        </script>
    </body>
</html>
```

## 四、沙箱机制

### 快照沙箱

> 应用的运行，从开始到结束，切换后不会影响到全局
> 如果有多个子应用就不能使用这种方式了，使用 es6 的 proxy
> 代理沙箱可以实现多应用沙箱，把不同的应用用不同的代理来处理

```
class SanpshotSandBox{
    constructor() {
        this.proxy = window;
        this.modifyPropsMap = {}; // 记录在window上的属性
        this.active();
    }
    active() {
        this.windowSnapshot = {}; // 拍照
        for(const key in window) {
            if(window.hasOwnproperty(key)) {
                this.windowSnapshot[key] = window[key]
            }
        }
        Object.keys(this.modifyPropsMap).forEach(p=> {
            window[p] = this.modifyPropsMap[p];
        })
    }
    inactive() {
        for(const key in window) {
            if(window.hasOwnproperty(key)) {
                if(window[key] !== this.windowSnapshot[key]) {
                    this.modifyPropsMap[key] = window[key];
                    window[key] = this.windowSnapshot[key];
                }
            }
        }
    }
}

let sandbox = new SanpshotSandBox();

((window)=> {
    window.a = 1;
    window.b = 2;
    console.log(a,b);
    sandbox.inactive();
    console.log(a,b);
    sandbox.active();
    console.log(a,b);
})(sandbox.proxy);

```

### 代理沙箱

```
class ProxySandbox{
    constructor() {
        const rawWdindow = window;
        const fakeWindow = {}
        const proxy = new Proxy(fakeWindow, {
            set(target, p, value) {
                target[p] = value;
                return true;
            }
            get(target, p) {
                return target[p] || rawWindow[p];
            }
        })
        this.proxy = proxy;
    }
}

let sandbox1 = new ProxySandbox();
let sandbox2 = new ProxySandbox();
window.a = 2;
((window)=> {
    window.a = 'hello';
})(sandbox1.proxy)
((window)=> {
    window.a = 'world';
})(sandbox2.proxy)
```

### 子应用的 webpack config 配置

```
module.exports = {
    publicPath: '//localhost:2000', // 保证子应用的静态资源都是在2000端口上发送的
    devServer: {
        port: 2000, // qiankun通过fetch来获取资源
        headers: {
                'Access-Control-Allow-Origin': '*‘ // 允许所有访问
        }
    },
    // 需要获取打包的内容格式 umd
    configgureWebpack: {
        output: {
            libraryTarget: 'umd',
            library: 'm-vue'
        }
    }

}
```
