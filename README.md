#Base

Base 是使用 Class 创建的一个基础类，默认混入了 Events 模块，用 Base派生出来的子类，默认带有 Class, Events 模块的功能，且拥有``get``，``set``，``destroy``方法

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
        // 当实例化完毕之后，如果该实例有 setup方法，会自动调用 setup 方法
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
