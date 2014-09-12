#Base

Base 是使用 Class 创建的一个基础类，默认混入了 Events 模块，用 Base派生出来的子类，默认带有 Class, Events 模块的功能，且拥有``get``，``set``，``destroy``方法

##使用说明

###``Base.extend(properties)``

基于Base创建子类

```
var Base = require('base');

var Pig = Base.extend({
    attrs : {
        name : ''
    },
    talk : function(){
        console.log('我是' + this.get('name'));
    }
});

var pig = new Pig({
    name : 'SuperMan'
});

pig.talk(); // 我是SuperMan
pig.get('name'); // SuperMan
pig.set('name', 'Iron');
pig.talk(); // 我是Iron
pig.get('name'); // Iron
```
