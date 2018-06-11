// ajax封装
function ajax (url, data, success, apitype, type, dataType, async, error) {
  type = type || 'post';// 请求类型
  dataType = dataType || 'json';// 接收数据类型
  async = async || true;// 异步请求
  apitype = apitype || 1; // 接口类型 1: sjd; 2:第三方接口
  success = success || function (res) {
    /* console.log('请求成功'); */
    console.log(res, '请求成功')
  };
  error = error || function (err) {
    /* console.error('请求成功失败'); */
    /* data.status;//错误状态吗 */
    setTimeout(function () {
      if (err.code == 404) {
        console.log('请求失败，请求未找到');
      } else if (err.code == 503 || err.code == 500) {
        console.log('请求失败，服务器内部错误');
      } else {
        console.log('请求失败,网络连接超时');
      }
    }, 500);
  };
  $.ajax({
    'url': url,
    'data': data,
    'type': type,
    'dataType': dataType,
    'async': async,
    'success': success,
    'error': error,
    'jsonpCallback': 'jsonp' + (new Date()).valueOf().toString().substr(-4),
    // 'headers': {
    //   Accept: 'application/json; charset=utf-8'
    // },
    'beforeSend': function (req) {
      if (apitype == 1) {
        console.log(apitype, 'this is sjd_API')
      } else {
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      }
    }
  })
}
// submitAjax(post方式按钮提交)
export const submitAjax = (form, success, apitype) => {
  form = $(form);
  var url = form.attr('action');
  var data = form.serialize();
  return ajax(url, data, success, apitype, 'post', 'json', false);
}

// ajax提交(post方式提交)
export const post = (url, data, success, apitype) => {
  return ajax(url, data, success, apitype, 'post', 'json', false);
}

// ajax提交(get方式提交)
export const get = (url, success, apitype) => {
  return ajax(url, {}, success, apitype, 'get', 'json', false);
}

// jsonp跨域请求(get方式提交)
export const jsonp = (url, success, apitype) => {
  return ajax(url, {}, success, apitype, 'get', 'jsonp', false);
}
