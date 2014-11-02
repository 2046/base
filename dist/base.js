define(function(require, exports, module){
    'use strict'
    
    // Thanks to:
    //     - http://documentcloud.github.com/backbone/#Model
    //     - https://github.com/aralejs/base/blob/master/src/base.js
    
    var Base, Class, Events, util;
    
    util = require('./util');
    Class = require('class');
    Events = require('events');
    
    Base = new Class({
        Implements : [Events],
        initialize : function(opt){
            this.attrs = {};
            mergeInheritedAttrs(this);
    
            if(opt){
                mergeAttrs(this.attrs, opt);
            }
    
            parseEventsFromAttrs(this);
            copySpecialProps(this.specialProps || [], this, this.attrs, true);
            this.init && this.init();
        },
        get : function(key){
            return this.attrs[key];
        },
        set : function(key, val, opt){
            var attrs, silent, current, prev;
    
            if(key == null){
                return this;
            }
    
            if(util.isString(key)){
                (attrs = {})[key] = val;
            }else{
                attrs = key;
                opt = val;
            }
    
            opt || (opt = {});
            silent = opt.silent;
    
            current = this.attrs;
    
            for(key in attrs){
                if(!attrs.hasOwnProperty(key)){
                    continue;
                }
    
                val = attrs[key];
                prev = this.get(key);
    
                current[key] = val;
                if(!silent && !util.isEqual(prev, val)){
                    this.trigger('change:' + key, val, prev, key);
                }
            }
    
            return this;
        },
        destroy : function(){
            this.off();
    
            for(var key in this){
                if(this.hasOwnProperty(key)){
                    delete this[key];
                }
            }
    
            this.destroy = function(){};
        }
    });
    
    function mergeInheritedAttrs(ctx){
        var proto, inherited, attrs, index, len, specialProps;
    
        index = 0;
        inherited = [];
        attrs = ctx.attrs;
        proto = ctx.constructor.prototype;
        specialProps = ctx.specialProps || [];
    
        while(proto){
            if(!proto.hasOwnProperty('attrs')){
                proto.attrs = {}
            }
    
            copySpecialProps(specialProps, proto.attrs, proto);
    
            if(!util.isEmptyObject(proto.attrs)){
                inherited.unshift(proto.attrs);
            }
    
            proto = proto.constructor.superclass;
        }
    
        for(len = inherited.length; index < len; index++){
            mergeAttrs(attrs, inherited[index]);
        }
    };
    
    function copySpecialProps(specialProps, receiver, supplier, isAttr2Prop){
        var index, len, key;
    
        for(index = 0, len = specialProps.length; index < len; index++){
            key = specialProps[index];
    
            if(supplier.hasOwnProperty(key)){
                receiver[key] = isAttr2Prop ? receiver.get(key) :  supplier[key];
            }
        }
    };
    
    function mergeAttrs(receiver, supplier){
        var key, value, val;
    
        for(key in supplier){
            if(supplier.hasOwnProperty(key)){
                value = supplier[key];
    
                if(util.isArray(value)){
                    val = value.slice();
                }else if(util.isPlainObject(value)){
                    util.isPlainObject(receiver[key]) || (receiver[key] = {});
                    val = mergeAttrs(receiver[key], value);
                }else{
                    val = value;
                }
    
                receiver[key] = val;
            }
        }
    
        return receiver;
    };
    
    function parseEventsFromAttrs(ctx){
        var key, attrs, result;
    
        attrs = ctx.attrs;
    
        for(key in attrs){
            if(attrs.hasOwnProperty(key)){
                if(result = key.match(/^(on)([A-Z].*)$/)){
                    ctx.on(util.firstLower(result[2]), attrs[key]);
                }
    
                ctx.on('change:' + key, ctx['_onChange' + util.firstUpper(key)]);
            }
        }
    };
    
    module.exports = Base;
    
});