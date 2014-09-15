#Base

Base 是使用 Class 创建的一个基础类，默认混入了 Events 模块，用 Base派生出来的子类，默认带有 Class, Events 模块的功能，且拥有``get``，``set``，``destroy``方法

##使用

下载项目中 dist 目录里面的文件，并配置好模块相关信息（如：路径，别名），使用如下示例代码即可开始使用。

```
seajs.use(['base'], function(Base){
    var Test = Base.extend({
        attrs : {
            name : 'test'
        },
        setup : function(){
            console.log('init');
        }
    });
    
    var test = new Test({
        say : 'hello world'
    }); // init
    
    test.get('name'); // test
    test.get('say'); // hello world
});

require(['base'], function(Base){
    var Test = Base.extend({
        attrs : {
            name : 'test'
        },
        setup : function(){
            console.log('init');
        }
    });
    
    var test = new Test({
        say : 'hello world'
    }); // init
    
    test.get('name'); // test
    test.get('say'); // hello world
});
```

##使用说明

###``Base.extend([properties])``

基于 Base 派生子类，``properties``是要混入的实例属性集合。

```
var Base = require('base');

var Pig = Base.extend({
    attrs : {
        name : ''
    },
    talk : function(){
        console.log('我是' + this.get('name'));
    },
    setup : function(){
        console.log('initialized');
    }
});

var pig = new Pig({
    name : 'SuperMan'
}); // initialized

pig.talk(); // 我是SuperMan
pig.get('name'); // SuperMan
pig.set('name', 'Iron');
pig.talk(); // 我是Iron
pig.get('name'); // Iron
```

###``properties``集合中特殊属性

####``attrs``属性，类定义时，通过设置 attrs 来定义该类有哪些属性

```
var Demo = Base.extend({
    attrs : {
        value1 : 1,
        value2 : 'a',
        value3 : true,
        value4 : /a/g
        value5 : [a,b,c]
        value6 : {a : 'a'}
        value7 : function(){}
        value8 : null
    }
});
```

当使用构造函数创建实例时，给构造函数传入的属性集合，将会自动 merge 到实例 attrs 属性上。

####``setup``属性，提供给子类的初始化方法，可以在此处理更多初始化信息

```
var Demo = Base.extend({
    setup : function(){
        console.log('hello');
    }
});
```

####``_onChangeX``属性，在初始化时，会自动将 _onChangeX 方法注册到实例的 change:x 事件上

```
var Demo = base.extend({
    attrs : {
        test : 'demo'
    },
    _onChangeTest : function(val, prev, key){
        console.log(val, prev, key);
    }
});
```

###get ``obj.get(key)``

获取某个属性值

```
var T = Base.extend({
    attrs : {
        name : 'superMan'
    }
});

var t = new T();
t.get('name'); // superMan
```

###set ``obj.set(key, value, options)``

设置某个属性值

当 options.silent 的值为 true 时，不会触发属性值对应的 change 事件

```
var T = Base.extend({
    attrs : {
        name : 'superMan'
    },
    _onChangeName : function(val){
        conaole.log('change:' + val);
    }
});

var t = new T();
t.get('name'); // superMan
t.set('name', 'Iron'); // change:Iron
t.set('name', 'Arrow', {silent : true}); // 没有触发 change 事件
```

###destroy ``obj.destroy()``

注销实例上的所有事件并删除实例上所有的属性

```
var T = Base.extend({
    attrs : {
        name : 'superMan'
    },
    _onChangeName : function(val){
        console.log('change:' + val);
    }
});

var t = new T();

t.destroy();
t.attrs // undefined
t.trigger('change:name'); // 无效果
```

###一个完整的例子

```
var Base = require('base');

var T = Base.extend({
    attrs : {
        name : '',
        color : '#fff'
    },
    setup : function(){
        console.log('My name: ' + this.get('name') + ', My color: ' + this.get('color') + ', My Language: ' + this.get('language'));
    },
    getName : function(){
        return this.get('name');
    },
    getColor : function(){
        return this.get('color');
    },
    getLanguage : function(){
        return this.get('language');
    },
    _onChangeName : function(val){
        console.log('changeName:' + val);
    },
    _onChangeColor : function(val){
        console.log('changeColor:' + val);
    },
    _onChangeLanguage : function(val){
        console.log('changeLanguage:' + val);
    }
});

var t = new T({
    name : 'superMan',
    color : '#000',
    language : 'english'
}); // My name: superMan, My color: #000, My language: english

t.getName(); // superMan
t.getColor(); // #000
t.getLanguage(); // english

t.set('name', 'Iron'); // changeName:Iron
t.set('color', '#ccc'); // changeColor:#ccc
t.set('language', 'chinese'); // changeLanguage:chinese

t.getName(); // Iron
t.getColor(); // #ccc
t.getLanguage(); // chinese

t.destroy();
```
