define(function(require, exports, module){
    var Base,expect, sinon;

    Base = require('base');
    sinon = require('sinon');
    expect = require('expect');

    function equals(){
        var args = arguments;
        expect(args[0]).to.equal(args[1]);
    }

    describe('Base', function(){
        it('normal usage', function(){
            var Animal = Base.extend({
                initialize : function(name){
                    this.name = name;
                },
                getName : function(){
                    return this.name;
                }
            });

            equals(new Animal('Tom').name, 'Tom');
            equals(new Animal('Tom2').getName(), 'Tom2');

            var Bird = Animal.extend({
                fly : function(){
                    return 'I can fly';
                }
            });

            var bird = new Bird('Twitter');
            equals(bird.name, 'Twitter');
            equals(bird.fly(), 'I can fly');
        });

        it('events supporting', function(){
            var counter = 0;

            var Bird = Base.extend({
                initialize : function(name){
                    this.name = name;
                },
                fly : function(){
                    this.trigger('fly');
                }
            });

            var bird = new Bird('Twitter');
            bird.on('fly', function(){
                counter++;
            });

            equals(counter, 0);
            bird.fly();
            equals(counter, 1);

            bird.off().fly();
            equals(counter, 1);
        });

        it('attrs merging', function(){
            var Widget = Base.extend({
                attrs : {
                    color : '#fff',
                    size : {
                        width : 100,
                        height : 100
                    }
                }
            });

            var myWidget = new Widget({
                color : '#f00',
                size : {
                    width : 200
                },
                position : {
                    top : 50,
                    left : 150
                }
            });

            equals(myWidget.get('color'), '#f00');
            equals(myWidget.get('size').width, 200);
            equals(myWidget.get('size').height, 100);
            equals(myWidget.get('position').top, 50);
            equals(myWidget.get('position').left, 150);
        });

        it('attrs cloning', function(){
            var Widget = Base.extend({
                attrs : {
                    color : '#fff',
                    size : {
                        width : 100,
                        height : 100
                    }
                }
            });

            var mySize = {
                width : 50,
                height : 50
            };

            var myWidget = new Widget({
                size : mySize
            });

            equals(myWidget.get('color'), '#fff');
            equals(myWidget.get('size') === mySize, false);
        });

        it('attrs from ancestors', function(){
            var Person = Base.extend({
                attrs : {
                    o1 : 'p1',
                    o2 : 'p2',
                    o3 : 'p3'
                }
            });

            var Man = Person.extend({
                attrs : {
                    o3 : 'm1',
                    o4 : 'm2'
                },
                initialize : function(){
                    Man.superclass.initialize.apply(this, arguments);
                }
            });

            var Child = Man.extend({
                attrs : {
                    o4 : 'c1',
                    o5 : 'c2'
                },
                initialize : function(options){
                    options.o6 = 'c6';
                    Child.superclass.initialize.apply(this, arguments);
                }
            });

            var c = new Child({o4 : 'o4', o2 : 'o2'});
            equals(c.get('o1'), 'p1');
            equals(c.get('o2'), 'o2');
            equals(c.get('o3'), 'm1');
            equals(c.get('o4'), 'o4');
            equals(c.get('o5'), 'c2');
            equals(c.get('o6'), 'c6');
        });

        it('alipay/arale#49: deep clone bug in initAttrs', function(){
            var A = Base.extend({
                attrs : {
                    array : [1, 2, 3],
                    element : null,
                    point : null
                }
            });

            var a = new A({element : document.body});
            var attrs = a.attrs;
            attrs.array.push(4);
            equals(attrs.array.length, 4);
            equals(A.prototype.attrs.array.length, 3);
            equals(attrs.point, null);
        });

        it('attrs: inherited ones', function(){
            var A = Base.extend({
                attrs : {
                    x : 'x'
                }
            });

            var B = A.extend({
                attrs : {
                    x : 'x2'
                }
            });

            var b = new B({x : 'x3'});
            equals(b.get('x'), 'x3');

            var B2 = A.extend({
                attrs : {
                    x : 'x3'
                }
            });

            var b2 = new B2();
            equals(b2.get('x'), 'x3');
            b2.set('x', 'x4');
            equals(b2.get('x'), 'x4');
        });

        it('attrs change events', function(){
            var counter = 0;
            var counterY = 0;

            var A = Base.extend({
                attrs : {
                    x : 1,
                    y : 1
                },
                _onChangeY : function(val, prev){
                    equals(prev, 1);
                    equals(val, 2);
                    counterY++;
                }
            });

            var a = new A({x : 2});

            a.on('change:x', function(val, prev, key){
                if(counter === 0){
                    equals(prev, 2);
                    equals(val, 3);
                }

                equals(key, 'x');
                equals(this, a);
                counter++;
            });

            a.set('x', 3);
            a.set('x', 3);
            equals(counter, 1);

            a.set('x', 4, {silent : true});
            equals(counter, 1);

            a.set('x', 5);
            equals(counter, 2);

            a.set('y', 2);
            equals(counterY, 1);

            a.set('y', 3, {silent : true});
            equals(counterY, 1);
        });

        it('example in attribute.md', function(){
            var Panel = Base.extend({
                attrs : {
                    y : 0,
                    size : {
                        width : 100,
                        height : 100
                    }
                },
                setup : function(){
                    this.element = $(this.get('element')).eq(0);
                },
                _onChangeY : function(val){
                    this.element.offset({top : val});
                }
            });

            var panel = new Panel({
                element : '#test',
                y : 100,
                size : {
                    width : 200
                }
            });

            equals(panel.get('y'), 100);
            equals(panel.get('size').width, 200);
            equals(panel.get('size').height, 100);
        });

        it('test change method', function(){
            var counter = 0;

            var A = Base.extend({
                attrs : {
                    a : 1,
                    b : 1,
                    c : 1
                },
                _onChangeA : function(){
                    counter++;
                },
                _onChangeB : function(){
                    counter++;
                },
                _onChangeC : function(){
                    counter++;
                }
            });

            counter = 0;
            var a = new A();
            equals(counter, 0);

            counter = 0;
            var a2 = new A({a : 2});
            equals(counter, 0);

            counter = 0;
            a2.set('a', 3);
            equals(counter, 1);

            counter = 0;
            var a3 = new A({a : 1,b : 2,c : 3});
            equals(counter, 0);

            counter = 0;
            a3.set({a : 2,b : 3,c : 4});
            equals(counter, 3);
        });

        it('#2 share instance', function(){
            var M = Base.extend({
                attrs : {
                    date : 2
                },
                setup : function(){
                    this.set('date', 2);
                }
            });

            var m1 = new M();
            var m2 = new M();

            equals(m1.get('date'), 2);
            equals(m2.get('date'), 2);

            m1.set('date', 4);

            equals(m1.get('date'), 4);
            equals(m2.get('date'), 2);
        });

        it('#4 the merging bug of jQuery-like object', function(){
            var T = Base.extend({
                attrs : {
                    baseElement : {_id : 1}
                }
            });

            var t = new T({
                baseElement : $({})
            });

            equals(t.get('baseElement')._id, undefined);
        });

        it('destroy', function(){
            var spy = sinon.spy();
            var T = Base.extend({
                initialize : function(){
                    this.a = 1;
                }
            });

            var t = new T();
            t.on('a', spy);

            equals(t.a, 1);
            t.trigger('a');
            expect(spy.called).to.be.ok();
            spy.reset();

            t.destroy();
            equals(t.a, undefined);
            t.trigger('a');
            expect(spy.called).not.to.be.ok();
            spy.reset();
        });

        it('other attr format', function(){
            var T = Base.extend({
                attrs : {
                    a : true,
                    b : /a/g
                }
            });

            var t = new T();
            t.set('a', false);
            t.set('b', /b/g);
            equals(t.get('a'), false);
            expect(t.get('b')).to.eql(/b/g);
        });

        it('destroy once', function(){
            var calledA = 0, calledB = 0;
            var A = Base.extend({
                destroy : function(){
                    calledA++;
                    A.superclass.destroy.call(this);
                }
            });

            var B = A.extend({
                destroy : function(){
                    calledB++;
                    B.superclass.destroy.call(this);
                }
            });

            var c = new B();
            c.destroy();
            c.destroy();
            expect(calledA).to.be(1);
            expect(calledB).to.be(1);
        });

        it('isEmptyObject #22', function(){
            $('<div id="test"></div>').appendTo('body');
            var T = Base.extend({
                attrs : {
                    parentNode : document.body
                }
            });

            var t = new T();
            t.set('parentNode', $('#test')[0]);
            expect(t.get('parentNode')).to.eql($('#test')[0]);

            t.set('parentNode',document);
            expect(t.get('parentNode')).to.eql(document);

            t.set('parentNode', {});
            expect(t.get('parentNode')).to.eql({});

            t.set('parentNode', window);
            expect(t.get('parentNode')).to.eql(window);

            t.set('parentNode', undefined);
            expect(t.get('parentNode')).to.eql(undefined);

            t.set('parentNode', []);
            expect(t.get('parentNode')).to.eql([]);

            t.set('parentNode', {});
            expect(t.get('parentNode')).to.eql({});

            t.set('parentNode', null);
            expect(t.get('parentNode')).to.eql(null);

            t.set('parentNode', $('#test'));
            expect(t.get('parentNode')).to.eql($('#test'));

            t.set('parentNode', Number.MAX_VALUE);
            expect(t.get('parentNode')).to.eql(Number.MAX_VALUE);

            t.set('parentNode', location);
            expect(t.get('parentNode')).to.eql(location);

            var sString = new String();
            t.set('parentNode', sString);
            expect(t.get('parentNode')).to.eql(sString);

            var sArray = new Array();
            t.set('parentNode', sArray);
            expect(t.get('parentNode')).to.eql(sArray);

            var sObject = new Object();
            t.set('parentNode', sObject);
            expect(t.get('parentNode')).to.eql(sObject);

            var sNumber = new Number();
            t.set('parentNode', sNumber);
            expect(t.get('parentNode')).to.eql(sNumber);

            t.set('parentNode', {});
            expect(t.get('parentNode')).to.eql({});

            var sFunction = new Function();
            t.set('parentNode', sFunction);
            expect(t.get('parentNode')).to.eql(sFunction);

            $('#test').remove();
        });

        it('attribute start width _', function(){
            var spy = sinon.spy();
            var T = Base.extend({
                attrs : {
                    _a : ''
                },
                _onChange_a : spy
            });

            var t = new T();
            t.set('_a', 'a');
            expect(t.get('_a')).to.be('a');
            expect(spy.calledOnce).to.be.ok();
        });
    });
});