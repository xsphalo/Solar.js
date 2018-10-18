
// 将DOM树生成JSON数据
// Solar  virtual-dom (vue)浅示
var newscript = documnet.createElement('script');
newscript.type = 'text/babel';
newscript.src = 'https://unpkg.com/babel-standalone@6.15/babel.min.js';
document.getElementsByName('head')[0].appendChild(newscript);
/** @jsx hyperScript **/
let vdom = (<ul className="list" data-name="jsontree">
                <ul>
                    <li>
                        <img src="www.xsphalo.com/ahah.png?123" width="16px"/>
                    </li>
                    <li>
                        <a href="www.xsphalo.com" target="_blank">示例呆萌</a>
                    </li>
                </ul>
            </ul>
)
function hyperScript(nodeName , attributes , ...args){
    //返回虚拟DOM, 虚拟DOM结构？
    let children =  args.length ? [].concat(...args) : [];
    return {nodeName,attributes,children  }
}
// console.log( JSON.stringify( vdom , null , 2) )
console.log( vdom )
// 将DOM信息的JSON生成DOM
const JsonTree = {
    "tagName": "ul",
    "props": {
      "className": "list",
      "data-name": "jsontree"
    },
    "childern": [{
        "tagName": "li",
        "childern": [{
          "tagName": "img",
          "props": {
            "src": "www.xsphalo.com/ahah.png?123",
            "width": "16px"
          }
        }]
      },
      {
        "tagName": "li",
        "childern": [{
          "tagName": "a",
          "props": {
            "href": "www.xsphalo.com",
            "target": "_blank"
          },
          "children": "示例呆萌"
        }]
      }
    ]
  };
  
  function parseDOM(jsontree){
    const {tagName,props,childern} = jsontree;
    const element = document.createElement(tagName);
    Object.keys(props || {}).forEach(item => element.setAttribute(item, props[item]));
    jsontree.children&&(element.innerHTML = jsontree.children)
    if (childern&&childern.length) {
      childern.forEach(item => element.appendChild(parseDOM(item)));
    }
    return element;
  }
  var vnodes = parseDOM(JsonTree);
  console.log(vnodes)