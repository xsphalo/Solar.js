/*!
 * =====================================================
 * SolarJs v0.0.1 
 * =====================================================
 */
/**
 * Solar核心JS
 * @name. g|Global|Factory
 */
(function(g, f) {
    var solar = f();
    g.Solar = function(opts = {}) {
        var app = new solar(opts);
        var data = app._data;
        var vessel_options = app.$options
        console.log(app, 'app')
        if (vessel_options && vessel_options.onshow && typeof(vessel_options.onshow) === 'function') {
            var onshow = vessel_options.onshow;
            onshow()
        }
    }
})(typeof global !== "undefined" ? global : this.window || this.global, (function() {
    // mvvm入口函数  用于整合 数据监听器_observer、 指令解析器_compile、连接Observer和Compile的_watcherTpl
    function Solar(options = {}) { // 防止没传，设一个默认值
        this.$options = options; // 配置挂载
        this.$el = document.querySelector(options.el); // 获取dom
        this._data = options.data; // 数据挂载
        this._watcherTpl = {}; // watcher池
        this._observer(this._data); // 传入数据，执行函数，重写数据的get set
        this._compile(this.$el); // 传入dom，执行函数，编译模板 发布订阅
        this._methods(this.$options, this.$el); //主动事件触发器
        this._initstate(this.$options); //主动事件触发器
        this._directnodes(this.$el); // 过去节点上绑定属性
        var bindings = {};
        this._bindings = bindings;
    };
    // 设置指令前缀名
    const prefix = 'v';
    // 各种指令
    var Directives = {
        text: function(el, value) {
            el.textContent = value || '';
        },
        show: function(el, value) {
            el.style.display = value ? '' : 'none';
        },
        model: function(el, value, dirAgr, dir, vm, key) {
            let eventName = 'keyup';
            el.value = value || '';
            if (el.handlers && el.handlers[eventName]) {
                el.removeEventListener(eventName, el.handlers[eventName]);
            } else {
                el.handlers = {};
            }

            el.handlers[eventName] = function(e) {
                vm[key] = e.target.value;
            }

            el.addEventListener(eventName, el.handlers[eventName]);
        },
        on: {
            update: function(el, handler, eventName, directive) {
                if (!directive.handlers) {
                    directive.handlers = {}
                }

                var handlers = directive.handlers;

                if (handlers[eventName]) {
                    //绑定新的事件前移除原绑定的事件函数
                    el.removeEventListener(eventName, handlers[eventName]);
                }
                //绑定新的事件函数
                if (handler) {
                    handler = handler.bind(el);
                    el.addEventListener(eventName, handler);
                    handlers[eventName] = handler;
                }
            }
        }
    }

    function getdirects(Directives) {
        const inputevents = ['click', 'change', 'blur'];
        return Object.keys(Directives).map(function(directive) {
            return '[' + prefix + '-' + directive + ']';
        }).join() + ',' + inputevents.map(function(eventName) {
            return '[' + prefix + '-on-' + eventName + ']';
        }).join();
    }
    // 获取所有绑定指令的节点
    Solar.prototype._directnodes = function(el) {
        var _this = this;
        var dirnames = getdirects(Directives);
        var directNodes = el.querySelectorAll(dirnames);

        function getAttributes(attributes) {
            return [].map.call(attributes, function(attr) {
                return {
                    name: attr.name,
                    value: attr.value
                }
            })
        }
        // 将指令解析，提取出对应指令的方法,并且 return 出一个对象，此对象中包含指令名称，指令对应方法等
        function parseDirective(attr) {
            if (attr.name.indexOf(prefix) === -1) return;
            //移除 'v-' 前缀, 提取指令名称、指令参数
            var directiveStr = attr.name.slice(prefix.length + 1),
                argIndex = directiveStr.indexOf('-'),
                directiveName = argIndex === -1 ? directiveStr : directiveStr.slice(0, argIndex),
                directiveDef = Directives[directiveName],
                arg = argIndex === -1 ? null : directiveStr.slice(argIndex + 1);
            var key = attr.value;
            return directiveDef ? {
                    attr: attr,
                    key: key,
                    dirname: directiveName,
                    definition: directiveDef,
                    argument: arg,
                    update: typeof directiveDef === 'function' ? directiveDef : directiveDef.update
                } :
                null;
        }
        // 节点指令绑定
        function bindDirective(vm, el, assemble, directive) {

            el.removeAttribute(directive.attr.name);
            var key = directive.key,
                binding = assemble[key];

            if (!binding || binding == undefined) {
                assemble[key] = binding = {
                    value: '',
                    directives: []
                }
            }

            directive.el = el;
            binding.directives.push(directive);
            _this._bindings = binding
            //避免重复定义
            if (!vm.hasOwnProperty(key)) {
                observer(vm, key, binding);
            }
        }

        function dispose(el) {
            getAttributes(el.attributes).forEach(function(attr) {
                var directive = parseDirective(attr);
                var tmpdatas = _this._bindings = {};
                if (directive) {
                    bindDirective(_this, el, tmpdatas, directive);
                }
            })
        }
        Array.prototype.forEach.call(directNodes, dispose);
        dispose(el);
    }

    function observer(vm, key, binding) {
        Object.defineProperty(vm, key, {
            get: function() {
                return binding.value;
            },
            set: function(value) {
                binding.value = value;
                binding.directives.forEach(function(item) {
                    item.update(
                        item.el,
                        value,
                        item.argument,
                        item,
                        vm,
                        key
                    )
                })
            }
        })
    }

    function extend(child, parent) {
        parent = parent || {};
        child = child || {};

        for (var key in parent) {
            if (parent.hasOwnProperty(key)) {
                child[key] = parent[key];
            }
        }

        return child;
    }

    // 重写data 的 get set  更改数据的时候，触发watch 更新视图
    Solar.prototype._observer = function(obj) {
        var _this = this;
        Object.keys(obj).forEach(key => { // 遍历数据
            _this._watcherTpl[key] = { // 每个数据的订阅池()
                _directives: []
            };
            var value = obj[key]; // 获取属性值
            var watcherTpl = _this._watcherTpl[key]; // 数据的订阅池
            Object.defineProperty(_this._data, key, { // 双向绑定最重要的部分 重写数据的set get
                configurable: true, // 可以删除
                enumerable: true, // 可以遍历
                get() {
                    // console.log(`${key}获取值：${value}`);
                    return value; // 获取值的时候 直接返回
                },
                set(newVal) { // 改变值的时候 触发set
                    // console.log(`${key}更新：${newVal}`);
                    if (value !== newVal) {
                        value = newVal;
                        if (watcherTpl._directives) {
                            watcherTpl._directives.forEach((item) => { // 遍历订阅池 
                                item.update(item.el, value, item.argument, item, _this, key);
                                // 遍历所有订阅的地方(v-model+v-bind+{{}}) 触发this._compile()中发布的订阅Watcher 更新视图  
                            });
                        }

                    }
                }
            })
        });
    }

    // 模板编译
    Solar.prototype._compile = function(el) {
        var _this = this,
            nodes = el.children; // 获取app的dom
        for (var i = 0, len = nodes.length; i < len; i++) { // 遍历dom节点
            var node = nodes[i];
            if (node.children.length) {
                _this._compile(node); // 递归深度遍历 dom树
            }

            // 如果有v-model属性，并且元素是INPUT或者TEXTAREA，我们监听它的input事件    
            if (node.hasAttribute('v-model') && (node.tagName = 'INPUT' || node.tagName == 'TEXTAREA')) {
                node.addEventListener('input', (function(key) {
                    var attVal = node.getAttribute('v-model'); // 获取v-model绑定的值
                    _this._watcherTpl[attVal]._directives.push(new Watcher( // 将dom替换成属性的数据并发布订阅 在set的时候更新数据
                        node,
                        _this,
                        attVal,
                        'value'
                    ));
                    return function() {
                        _this._data[attVal] = nodes[key].value; // input值改变的时候 将新值赋给数据 触发set=>set触发watch 更新视图
                    }
                })(i));
            }

            if (node.hasAttribute('v-text')) { // v-text 
                var attrVal = node.getAttribute('v-text'); // 绑定的data
                _this._watcherTpl[attrVal]._directives.push(new Watcher( // 将dom替换成属性的数据并发布订阅 在set的时候更新数据
                    node,
                    _this,
                    attrVal,
                    'innerHTML'
                ))
            }

            var reg = /\{\{\s*([^}]+\S)\s*\}\}/g,
                txt = node.textContent; // 正则匹配{{}}
            if (reg.test(txt)) {
                node.textContent = txt.replace(reg, (matched, placeholder) => {
                    // matched匹配的文本节点包括{{}}, placeholder 是{{}}中间的属性名
                    var getName = _this._watcherTpl; // 所有绑定watch的数据
                    getName = getName[placeholder]; // 获取对应watch 数据的值
                    if (!getName._directives) { // 没有事件池 创建事件池
                        getName._directives = [];
                    }
                    getName._directives.push(new Watcher( // 将dom替换成属性的数据并发布订阅 在set的时候更新数据
                        node,
                        _this,
                        placeholder,
                        'innerHTML'
                    ));

                    return placeholder.split('.').reduce((val, key) => {
                        return _this._data[key]; // 获取数据的值 触发get 返回当前值 
                    }, _this.$el);
                });
            }
        }
    }

    // new Watcher() 为this._compile()发布订阅+ 在this._observer()中set(赋值)的时候更新视图
    function Watcher(el, solar, val, attr) {
        this.el = el; // 指令对应的DOM元素
        this.solar = solar; // Solar实例
        this.val = val; // 指令对应的值 
        this.attr = attr; // dom获取值，如value获取input的值 / innerHTML获取dom的值
        this.update(); // 更新视图
    }
    Watcher.prototype.update = function() {
        this.el[this.attr] = this.solar._data[this.val]; // 获取data的最新值 赋值给dom 更新视图
    }
    // 事件触发
    function abduct(fn, ctx) {
        function boundFn(a) {
            var l = arguments.length;
            return l ?
                l > 1 ?
                fn.apply(ctx, arguments) //通过返回函数修饰了事件的回调函数。绑定了事件回调函数的this。并且让参数自定义
                :
                fn.call(ctx, a) :
                fn.call(ctx)
        }
        // record original fn length
        boundFn._length = fn.length;
        return boundFn
    }

    function traversal(el) {
        var _this = this,
            nodes = el.children, // 获取app的dom
            regevent = /^[0-9a-zA-Z]+$/,
            eventarray = [];
        for (var i = 0, len = nodes.length; i < len; i++) { // 遍历dom节点
            var node = nodes[i];
            if (node.children.length) {
                traversal(node); // 递归深度遍历 dom树
            }
            if (node.hasAttribute('@click') || node.hasAttribute('v-on:click')) { // 事件指令 
                var attrEvent = node.getAttribute('@click') || node.getAttribute('v-on:click'); // 获取事件名
                if (regevent.test(attrEvent)) {
                    eventarray.push(attrEvent)
                } else {
                    console.error(`${attrEvent}不是规范事件命名，请更换命名`)
                }
            }

        }
        return eventarray
    }
    Solar.prototype._methods = function(obj, el) {
        var methods = obj.methods;
        if (methods) {
            for (var key in methods) {
                this[key] = abduct(methods[key], this);
            }
        }
    }

    function extend(child, parent) {
        parent = parent || {};
        child = child || {};

        for (var key in parent) {
            if (parent.hasOwnProperty(key)) {
                child[key] = parent[key];
            }
        }

        return child;
    }
    Solar.prototype._initstate = function(opts) {
        const _this = this
        let _data = extend(opts.data, opts.methods);
        for (var key in _data) {
            if (_data.hasOwnProperty(key)) {
                _this[key] = _data[key];
            }
        }

    }
    return Solar;
}))
