/*!
 * =====================================================
 * SolarJs v0.0.1 
 * =====================================================
 */
/**
 * Solar核心JS
 * @name. g|Global|Factory
 */
(function(g,f){
    var solar = f();
    g.Solar = function(opts = {}){
        var app = new solar(opts);
        var data = app._data;
        var vessel_options = app.$options
        if (vessel_options&&vessel_options.onshow&&typeof(vessel_options.onshow) === 'function') {
            var onshow = vessel_options.onshow;
            onshow()
        }
    }
})(this,(function (){
// mvvm入口函数  用于整合 数据监听器_observer、 指令解析器_compile、连接Observer和Compile的_watcherTpl
    function Solar(options = {}) { // 防止没传，设一个默认值
        this.$options = options; // 配置挂载
        this.$el = document.querySelector(options.el); // 获取dom
        this._data = options.data; // 数据挂载
        this._watcherTpl = {}; // watcher池
        this._observer(this._data); // 传入数据，执行函数，重写数据的get set
        this._compile(this.$el); // 传入dom，执行函数，编译模板 发布订阅
        this._methods(this.$options, this.$el);//主动事件触发器
    };

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
                        watcherTpl._directives.forEach((item) => { // 遍历订阅池 
                            item.update();
                            // 遍历所有订阅的地方(v-model+v-bind+{{}}) 触发this._compile()中发布的订阅Watcher 更新视图  
                        });
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

            if (node.hasAttribute('v-bind')) { // v-bind指令 
                var attrVal = node.getAttribute('v-bind'); // 绑定的data
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
    function Watcher(el, vm, val, attr) {
        this.el = el; // 指令对应的DOM元素
        this.vm = vm; // myVue实例
        this.val = val; // 指令对应的值 
        this.attr = attr; // dom获取值，如value获取input的值 / innerHTML获取dom的值
        this.update(); // 更新视图
    }
    Watcher.prototype.update = function() {
        this.el[this.attr] = this.vm._data[this.val]; // 获取data的最新值 赋值给dom 更新视图
    }
    // 事件触发
    function abduct (fn, ctx) {
      function boundFn (a) {
        var l = arguments.length;
        return l
          ? l > 1
            ? fn.apply(ctx, arguments)//通过返回函数修饰了事件的回调函数。绑定了事件回调函数的this。并且让参数自定义
            : fn.call(ctx, a)
          : fn.call(ctx)
      }
      // record original fn length
      boundFn._length = fn.length;
      return boundFn
    }
    function traversal (el) {
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
                if(regevent.test(attrEvent)){
                    eventarray.push(attrEvent)
                }else{
                    console.error(`${attrEvent}不是规范事件命名，请更换命名`)
                }
            }

        }
        return eventarray
    }
    function enterhanlder(el) {
        var _this = this,
            nodes = el.children;
            console.log(nodes, 'nodes')
        for (var i = 0, len = nodes.length; i < len; i++) { // 遍历dom节点
            var node = nodes[i];
            if (node.children.length) {
                enterhanlder(node); // 递归深度遍历 dom树
            }
            if (node.hasAttributes()&&((node.hasAttribute('@click') || node.hasAttribute('v-on:click')))) {
                var attrs = node.attributes;
                var sda = Array.prototype.isPrototypeOf(node);
                node.addEventListener('click',function(){
                    console.log(i)
                })
            }
        }
    }
    function evnettrigger (rcont, i, el, riger) {
        var _this = this,
            rconts = [],
            nodes = el.children;
        rconts.push(rcont)
        var nodes = el.children;
        for (var j = 0, len = nodes.length; j < len; j++) { // 遍历dom节点
            var node = nodes[j];
            // if (node.children.length) {
            //     _transelval(node); // 递归深度遍历 dom树
            // }
            if (node.hasAttributes()&&((node.hasAttribute('@click') || node.hasAttribute('v-on:click')))) {
                var attrs = node.attributes;
                // node.onclick=function(){
                //     console.log('213xasxas'+i)
                // }
            }
        }
    }
    Solar.prototype._methods = function(obj,el){
        var methods = obj.methods;
        if (methods) {
            for (var key in methods) {
                // console.log(this, 'this')
                this[key] = abduct(methods[key], this);
            }
        }
        var eventaggregate = traversal(el)
        var lens = eventaggregate.length,i;
        Object.keys(methods).forEach(key => {
            for(var i = 0;i<lens;i++){
                if(eventaggregate[i] == key){
                    evnettrigger(key, i, el, methods);
                }
            }
        })
        enterhanlder(el)
    }
    return Solar;
}))
