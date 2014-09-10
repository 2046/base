'use strict'

var toString, isArray, isFunction, isString, keys, hasOwn iteratesOwnLast;

toString = Object.prototype.toString;
hasOwn = Object.prototype.hasOwnProperty;

var keys = Object.keys;
var EVENT_PATTERN = /^(on|before|after)([A-Z].*)$/;
var EVENT_NAME_PATTERN = /^(Change)?([A-Z])(.*)/;
var ATTR_SPECIAL_KEYS = ['value', 'getter', 'setter', 'readOnly'];

if(!keys){
    keys = function(o){
        var result = [];

        for(var name in o){
            if(o.hasOwnProperty(name)){
                result.push(name);
            }
        }

        return result;
    };
}

isString = function(val){
    return toString.call(val) === '[object String]';
};

isArray = function(val){
    return toString.call(val) === '[object Array]';
};

isFunction = function(val){
    return toString.call(val) === '[object Function]';
};

exports.initAttrs = function(opt){
    var propsInAttrs = this.propsInAttrs || [];
    var inheritedAttrs = getInheritedAttrs(this, propsInAttrs);
    var attrs = merge({}, inheritedAttrs);
    var userValues;

    if(opt){
        userValues = normalize(opt, true);
        merge(attrs, userValues);
    }

    this.attrs = attrs;
    setSetterAttrs(this, attrs, userValues);
    parseEventsFromAttrs(this, attrs);
    copyPropsInAttrs(propsInAttrs, this, attrs, true);
};

exports.get = function(key){
    var val, attr;

    attr = this.attrs[key] || {};
    val = attr.value;
    return attr.getter ? attr.getter.call(this, val, key) : val;
};

exports.set = function(key, val, opt){
    var attrs, silent, override, now, prev, attr;

    attrs = {};

    if(toString.call(key) === '[object String]'){
        attrs[key] = val;
    }else{
        attrs = key;
        opt = val;
    }

    if(opt){
        silent = opt.silent;
        override = opt.override;
    }

    now = this.attrs;

    for(key in attrs){
        if(!attrs.hasOwnProperty(key)){
            continue;
        }

        attr = now[key] || (now[key] = {});
        val  = attrs[key];

        if(attr.readOnly){
            throw new Error('This attribute is readOnly: ' + key);
        }

        if(attr.setter){
            val = attr.setter.call(this, val, key);
        }

        prev = this.get(key);

        if(!override && isPlainObject(prev) && isPlainObject(val)){
            val = merge(merge({}, prev), val);
        }

        now[key].value = val;

        if(!this.__initializeingAttrs && !isEqual(prev, val)){
            if(!silent){
                this.trigger('change:' + key, val, prev, key);
            }
        }
    }

    return this;
};

(function(){
    var props, prop;

    function F(){
        this.x = 1;
    };

    F.prototype = {
        'valueOf' : 1,
        'y' : 1
    };

    props = [];
    for(prop in new F()){
        props.push(prop);
    }
    iteratesOwnLast = props[0] !== 'x';
}());

function isPlainObject(object){
    var key;

    if(!object || toString.call(object) !== '[object Object]' || object == window|| object.nodeType){
        return false;
    }

    try{
        if(object.constructor && !hasOwn.call(object, 'constructor') && !hasOwn.call(object.constructor.prototype, 'isPrototypeOf')){
            return false;
        }
    }catch(e){
        return false;
    }

    if(iteratesOwnLast){
        for(key in object){
            return hasOwn.call(object, key);
        }
    }

    for(key in object){

    }

    return key === undefined || hasOwn.call(object, key);
};

function isEmptyObject(object){
    var key;

    if(!(object && toString.call(object) === '[object Object]' && object.hasOwnProperty)){
        return false;
    }

    for(key in object){
        if(object.hasOwnProperty(key)){
            return false;
        }
    }

    return true;
};

function merge(receiver, supplier){
    var key, value, prev;

    for(key in supplier){
        if(supplier.hasOwnProperty(key)){
            value = supplier[key];

            if(isArray(value)){
                value = value.slice();
            }else if(isPlainObject(value)){
                prev = receiver[key];
                isPlainObject(prev) || (prev = {});
                value = merge(prev, value);
            }

            receiver[key] = value;
        }
    }

    return receiver;
};

function getInheritedAttrs(instance, propsInAttrs){
    var proto, inherited, result;

    inherited = [];
    proto = instance.constructor.prototype;

    while(proto){
        if(!proto.hasOwnProperty('attrs')){
            proto.attrs = {};
        }

        copyPropsInAttrs(propsInAttrs, proto.attrs, proto);

        if(!isEmptyObject(proto.attrs)){
            inherited.unshift(proto.attrs);
        }

        proto = proto.constructor.superclass;
    }

    for(var i = 0, len = inherited.length; i < len; i++){
        if(!result){
            result = normalize(inherited[i]);
        }else{
            result = merge(result, normalize(inherited[i]));
        }
    }

    return result || {};
};

function copyPropsInAttrs(propsInAttrs, receiver, supplier, isAttr2Prop){
    for(var i =0, len = propsInAttrs.length; i < len; i++){
        var key = propsInAttrs[i];

        if(supplier.hasOwnProperty(key)){
            receiver[key] = isAttr2Prop ? receiver.get(key) : supplier[key];
        }
    }
};

function parseEventsFromAttrs(host, attrs){
    for(var key in attrs){
        if(attrs.hasOwnProperty(key)){
            var value = attrs[key].value, m;

            if(isFunction(value) && (m = key.match(EVENT_PATTERN))){
                host[m[1]](getEventName(m[2]), value);
                delete attrs[key];
            }
        }
    }
};

function getEventName(name){
    var m = name.match(EVENT_NAME_PATTERN);
    var ret = m[1] ? 'chang:' : '';
    ret += m[2].toLowerCase() + m[3];
    return ret;
};

function setSetterAttrs(host, attrs, opt){
    var key;

    host.__initializeingAttrs = true;

    for(key in opt){
        if(opt.hasOwnProperty(key) && attrs[key].setter){
            host.set(key, opt[key].value, {silent : true});
        }
    }

    delete host.__initializeingAttrs;
};

function normalize(attrs, isUserValue){
    var newAttrs, key, attr;

    newAttrs = {};

    for(key in attrs){
        attr = attrs[key];

        if(!isUserValue && isPlainObject(attr) && hasOwnProperties(attr, ATTR_SPECIAL_KEYS)){
            newAttrs[key] = attr;
            continue;
        }

        newAttrs[key] = {
            value : attr
        };
    }

    return newAttrs;
};

function hasOwnproperties(obj, prop){
    for(var i = 0, len = prop.length; i < len; i++){
        if(obj.hasOwnProperty(prop[i])){
            return true;
        }
    }

    return false;
};

function isEmptyAttrValue(o){
    return o == null || (isString(o) || isArray(o)) && o.length === 0 || isEmptyObject(o);
};

function isEqual(a, b){
    var className, p;

    if(a === b){
        return true;
    }

    if(isEmptyAttrValue(a) && isEmptyAttrValue(b)){
        return true;
    }

    className = toString.call(a);

    if(className != toString.call(b)){
        return false;
    }

    switch(className){
        case '[object String]':
            return a == String(b);
        case '[object Number]':
            return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
        case '[object Date]':
        case '[object Boolean]':
            return +a == +b;
        case '[object RegExp]':
            return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
        case '[object Array]':
            var aString, bString;

            aString = a.toString();
            bString = b.toString();
            return aString.indexOf('[object') === -1 && bString.indexOf('[object') === -1 && aString === bString;
    }

    if(typeof a != 'object' || typeof b != 'object'){
        return false;
    }

    if(isPlainObject(a) && isPlainObject(b)){
        if(!isEqual(keys(a), keys(b))){
            return false;
        }

        for(p in a){
            if(a[p] !== b[p]){
                return false;
            }
        }

        return true;
    }

    return false;
};