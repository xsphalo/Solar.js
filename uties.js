export function videoify(url) {
  const parse_url = function (url) {
    let tmp, res = {},
        r = {
          protocol: /([^\/]+:)\/\/(.*)/i,
          host: /(^[^\:\/]+)((?:\/|:|$)?.*)/,
          port: /\:?([^\/]*)(\/?.*)/,
          pathname: /([^\?#]+)(\??[^#]*)(#?.*)/
        };
    
    res["href"] = url;
    for (var p in r) {
      tmp = r[p].exec(url);
      res[p] = tmp[1];
      url = tmp[2];
      if (url === "") {
        url = "/";
      }
      if (p === "pathname") {
        res["pathname"] = tmp[1];
        res["search"] = tmp[2];
        res["hash"] = tmp[3];
      }
    }
    return res;
  };

  let _iframe_attrs, _pathname, _tmp, _search, _uri, _parts, _vid, _key, _iframe = [], _isInvalid = false;

  if (!url.length || (url.indexOf("//") < 0 && url.indexOf("https://") < 0)) {
    return '<img src="images/activity-common/error_video.jpg"/>';
  }
  
  _iframe_attrs = {
      'width':'',
      'height':'',
      'frameborder':'0',
      'allowfullscreen':'',
      'allowtransparency':false,
      'wmode':'transparent',
      'data-height':'195',
      'data-src':'',
      'style':'height:195px;width:100%;'
  };
  if (url.indexOf("<iframe") >=0 && url.indexOf('src') >= 0) {
    //通用格式
    return url;
  } else if((url.indexOf("v.youku.com") >= 0 || url.indexOf("m.youku.com") >= 0) && url.indexOf(".html") >= 0) {
    //优酷(解析拼接)
    url = parse_url(url);
    _pathname = url['pathname'].split('.');
    _tmp = _pathname[0];
    _tmp = _tmp.split('/');
    _tmp = typeof _tmp[_tmp.length - 1] == 'undefined' ? '' : _tmp[_tmp.length - 1];
    url = _tmp.replace('id_','');
    
    if (url.length) {_iframe_attrs.src = '//player.youku.com/embed/'+url;}
    
  } else if(url.indexOf("v.qq.com") >= 0 && url.indexOf(".html") >= 0) {
    //腾讯视频(解析拼接)
    url = parse_url(url),
    _pathname = url['pathname'].split('.'),
    _search = url['search'].replace("?", "");
    if (_search) {
      _iframe_attrs.src = '//v.qq.com/iframe/player.html?'+_search+'&tiny=0&auto=0&wmode=transparent';
    } else {
      _uri = _pathname[0];
      _parts = _uri.split('/');
      _vid = _parts[_parts.length-1];
      
      if (_vid) {_iframe_attrs.src = '//v.qq.com/iframe/player.html?vid='+_vid+'&auto=0&tiny=0&wmode=transparent'+url;}
    }
  } else {
    //支持mp4文件格式
    if (url.indexOf(".mp4") >= 0) {
      _iframe_attrs['src'] = url;
    } else {
      _isInvalid = true;
    }
  }

  if (_isInvalid) {
    return '<img src="images/activity-common/error_video.jpg"/>';
  } else {
    _iframe.push('<iframe ');
    for(_key in _iframe_attrs) {
      _iframe.push(_key + '="' + _iframe_attrs[_key] + '" ');
    }
    _iframe.push('></iframe>');

    return _iframe.join(' ');
  }
}