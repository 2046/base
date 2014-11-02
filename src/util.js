'use strict'

var o, toString, hasOwn, iteratesOwnLast, keys;

o = {};
keys = Object.keys;
toString = Object.prototype.toString;
hasOwn = Object.prototype.hasOwnProperty;

iteratesOwnLast = (function(){
    var prop, props = [];
    function F(){this.x = 1;};
    F.prototype = {'valueOf':1,'y':1};
    for(prop in new F()){props.push(prop);}
    return props[0] !== 'x';
})();

if(!keys){
    keys = function(obj){
        var result = [];

        for(var key in obj){
            if(hasOwn.call(obj, key)){
                result.push(key);
            }
        }

        return result;
    };
}

o.firstUpper = function(val){
    return val.charAt(0).toUpperCase() + val.slice(1);
};

o.firstLower = function(val){
    return val.charAt(0).toLowerCase() + val.slice(1);
};

o.isArray = function(val){
    return toString.call(val) === '[object Array]';
};

o.isString = function(val){
    return toString.call(val) === '[object String]';
};

o.isEmptyObject = function(obj){
    if(!obj || toString.call(obj) !== '[object Object]' ||
        obj.nodeType || obj == obj.window || !obj.hasOwnProperty){
        return false;
    }

    for(var key in obj){
        if(hasOwn.call(obj, key)){
            return false;
        }
    }

    return true;
};

o.isEmptyAttrValue = function(obj){
    return obj == null ||
            (o.isString(obj) || o.isArray(obj)) && o.length === 0 ||
            o.isEmptyObject(obj);
};

o.isPlainObject = function(obj){
    var key;

    if(!obj || toString.call(obj) !=='[object Object]' || obj == obj.window || obj.nodeType){
        return false;
    }

    try{
        if(obj.constructor &&
            !hasOwn.call(obj, 'constructor') &&
            !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')){
            return false;
        }
    }catch(e){
        return false;
    }

    if(iteratesOwnLast){
        for(key in obj){
            return hasOwn.call(obj, key);
        }
    }

    for(key in obj){}

    return key === undefined || hasOwn.call(obj, key);
};

o.isEqual = function(a, b){
    var type = toString.call(a);

    if(a === b){
        return true;
    }

    if(o.isEmptyAttrValue(a) && o.isEmptyAttrValue(b)){
        return true;
    }

    if(type != toString.call(b)){
        return false;
    }

    switch(type){
        case '[object String]':
            return a == String(b);
        case '[object Number]':
            return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
        case '[object Date]':
        case '[object Boolean]':
            return +a == +b;
        case '[object RegExp]':
            return a.source == b.source &&
                    a.global == b.global &&
                    a.multiline == b.multiline &&
                    a.ignoreCase == b.ignoreCase;
        case '[object Array]':
            var aString = a.toString();
            var bString = b.toString();

            return aString.indexOf('[object') === -1 &&
                    bString.indexOf('[object') === -1 &&
                    aString === bString;
    }

    if(typeof a != 'object' || typeof b != 'object'){
        return false;
    }

    if(o.isPlainObject(a) && o.isPlainObject(b)){
        if(!o.isEqual(keys(a), keys(b))){
            return false;
        }

        for(var p in a){
            if(a[p] !== b[p]){
                return false;
            }
        }

        return true;
    }

    return false;
};

module.exports = o;