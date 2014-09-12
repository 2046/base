'use strict'

var Base, Class, Events, Attribute, util;

util = require('./util');
Class = require('class');
Events = require('events');

Base = new Class({
    Implements : [Events, Attribute],
    initialize : function(opt){
        this.attrs = {};
        mergeInheritedAttrs(this);

        if(opt){
            mergeAttrs(this.attrs, opt);
        }

        bindChangeEvent(this);
        this.setup && this.setup();
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
    var proto, inherited, attrs, index, len;

    index = 0;
    inherited = [];
    attrs = ctx.attrs;
    proto = ctx.constructor.prototype;

    while(proto){
        if(!proto.hasOwnProperty('attrs')){
            proto.attrs = {}
        }

        if(!util.isEmptyObject(proto.attrs)){
            inherited.unshift(proto.attrs);
        }

        proto = proto.constructor.superclass;
    }

    for(len = inherited.length; index < len; index++){
        mergeAttrs(attrs, inherited[index]);
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

function bindChangeEvent(ctx){
    var key, attrs;

    attrs = ctx.attrs;

    for(key in attrs){
        if(attrs.hasOwnProperty(key)){
            ctx.on('change:' + key, ctx['_onChange' + util.capitalize(key)]);
        }
    }
};

module.exports = Base;