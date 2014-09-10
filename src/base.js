'use strict'

var Base, Class, Events, Attribute;

Class = require('class');
Events = require('events');
Attribute = require('./attribute');

Base = new Class({
    Implements : [Events, Attribute],
    initialize : function(opt){
        this.initAttrs(opt);
        parseEventsFromInstance(this);
    },
    destroy : function(){
        var key;

        this.off();
        for(key in this){
            if(this.hasOwnProperty(key)){
                delete this[key];
            }
        }

        this.destroy = function(){};
    }
});

function parseEventsFromInstance(ctx){
    var key, onChangeFn, attrs;

    attrs = ctx.attrs;

    for(key in attrs){
        if(attrs.hasOwnProperty(key)){
            if(onChangeFn = ctx['_onChange' + ucfirst(key)]){
                ctx.on('change:' + key, onChangeFn);
            }
        }
    }
};

function ucfirst(str){
    return str.charAt(0).toUpperCase() + str.substring(1);
};

module.exports = Base;