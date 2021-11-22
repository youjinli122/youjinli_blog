## vue3 做的性能优化 2 方面来说

1. 组件实例化开销比较大，都需要去开启一个 watcher 监听，data,props,methods,computed 等属性方法都是通过 this 来暴露给渲染函数，之前是一个个通过 object.defineProperty 上去,现在是通过 get 拿到属性之后通过 proxy 来拦截，根据之前已经知道拦截的是什么，直接从 props 返回给你，这样在组件实例化的时候性能就提升很多。
2. 虚拟 dom，把模板编译的优化做到极致，虚拟 dom 是不管动态还是静态从头 diff 到底，有了模板这一层之后做了动静态的区分，只需要记一个数组，把所有的动态的节点放进去，这样做的话，和模板的大小就没有关系了，只是取决于你的动态的数据有多少

### vue 双向绑定

所谓的双向绑定建立是在 MVVM 的模型基础上：

- 数据层 Model：应用的数据以及业务逻辑
- 视图层 view： 应用的展示效果，各类的 UI 组件等
- 业务逻辑层 viewModel： 负责将数据和视图关联起来

1. 数据变化后更新视图
2. 视图变化后更新数据

包含 2 个主要的组成部分

- 监听器 Observer： 对所有的数据属性进行监听
- 解析器：Compiler: 对每个元素节点的指令进行扫描和解析，根据指令替换数据，绑定对应的更新函数

#### 具体的实现原理

1. new Vue()执行初始化，对 data 通过 object.defineProperty/proxy 进行响应化处理，这个过程发生在 Observer 中，每个 key 都会有一个 dep 实例来存储 watcher 实例数组
2. 对模版进行编译时，v-开头的关键词指令解析，找到动态绑定的数据，从 data 中获取数据并初始化视图，这个过程发生在 compiler 里，如果遇到 v-model，就监听 input 事件，更新 data 的数值
3. 在解析指令的过程中，会定义一个更新函数和 watcher，之后对于的数据变化时 watcher 会调用更新函数，new watcher 的过程中回去读取 data 的 key，触发 getter 的依赖收集，将对应的 watcher 添加到 dep 里
4. 将来 data 中数据一旦发生变化，会首先找到对应的 dep，通知所有 watcher 执行更新函数

#### coding

1. 简单实现一个响应式函数，能对应对象内所有的 key 添加响应式特性及对数组的处理

```
const arrPrototype = Array.prototype;
const newArrPrototype = Object.create(arrPrototype);
['push','pop','shift','unshift','slice','splice'].forEach((methodName)=> {
    arrPrototype[methodName].call(this,...arguments);
    render(methodName, ...arguments)
})
const render=(key,val)=> {
    console.log(key,val);
}
const defineReative = (obj,key,val)=> {
    reactive(val); // 递归
    Object.defineOroperty(obj,key,{
        get() {
            return val;
        },
        set(newValue) {
            if(newValue === val)return;
        }
        val = newValue
        render(key,val);
    })
}
const reactive = (obj)=> {
    if(typeof obj === 'object) {
        for(const key in obj) {
            defineReative(obj,key, obj[key]);
        }
    }
}
const data = {
    a:1,
    b:2,
    c: {
        c1: {
            af: 999
        },
        c2: 4
    }
}
reactive(data);
```

### 把虚拟 dom 转换成真实 dom

```
const vnode = {
    tag: 'DIV',
    attrs: {
        id: 123
    },
    children: [{
        tag: 'span',
        attr: {
            id: 23
        },
        children: [{
            tag: 'A',
            children: null
        }]
    }]
}
// 1.递归首先要想到终止条件 2.定义函数的职责
function render(vnode) {
    if(typeof vnode === 'number') {
        vnode = String(vnode);
    }
    if(typeof vnode === 'string'){
        return document.createTextNode(vnod);
    }
    const element = document.createElement(vnode.tag);
    if(vnode.attrs) {
        Object.keys(vnode.attrs).forEach((attrKey)=> {
            element.setAttribute(key, vnode.attrs[attrKey]);
        })
    }
    if(vnode.children){
        vnode.children.forEach((childNode)=> {
            element.appendChild(render(childNode));
        })
    }
    return element;
}
```

#### 如何让一个对象可遍历

```
const obj = {
    count: 0,
    [Symbol.iterator]:()=> {
        return next: ()=> {
            obj.count++;
            if(obj.count <= 10) {
                return {
                    value: obj.count,
                    done: false
                }
            }else {
                return {
                    value: undefined,
                    done: true
                }
            }
        }
    }
}
for(const item of obj) {
    console.log(item); // 1,2,3,4,5,6,,7,8,9,10
}
```

### JSON.stringify 序列化为什么会报错？忽略 undefined,function，symbol，循环引用无法处理

```
function deepClone(obj, hash = new WeakMap()) {
    if(obj === null) {
        return null;
    }
    if(obj instanceof Date) {
        return new Date(obj)
    }
    if(obj instanceof RegExp) {
        return new RegExp(obj);
    }
    if(typeof obj !== 'object) { // 终止条件
        return obj;
    }
    if（hash.has(obj)) {
        return hash.get(obj) // 解决循环引用的问题
    }
    const resObj = Array.isArray(obj) ? [] : {};
    hash.set(obj, resObj);
    Reflect.ownKeys(obj).forEach(key=> {
        resObj[key] = deepClone(obj[key], hash);
    })
}
```

```
function instanceof(L,R) {
    if(typeof L !== 'object' || R === null)return false;
    while(true) {
        if(left === null)return false;
        if(L.__proto__ === R.prototype)return true;
        L = L.prototype
    }
}
```
