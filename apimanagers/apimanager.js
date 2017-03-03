const kQQKAPIClientSecret = "ed6a36bd83f58b68a62a40ebb1f6a210"
const kUDID = "d33d2fce6c1748beb102dd7abb7f8cef"
const kQQKAPIHost = "api_wxapplekongkong"
const kUSERTOKEN = ""

var config = require("../config.js")
var util = require("../utils/util.js")

function lkkApiHash(url) {
    var host = config.lkkHost
    var querys = (typeof url == 'string') && url.split(host)
    var url_ = querys && querys.pop()
    var plain = kUDID + kUSERTOKEN + url_ + kQQKAPIClientSecret + kUDID
    return util.MD5(plain)
}

function lkkHeader(url) {
    return {
        "BAPI-APP-KEY": kQQKAPIHost,
        "UDID": kUDID,
        "APP_VERSION": config.appVersion,
        "BAPI-HASH": lkkApiHash(url),
        "BAPI-NONCE": kUDID
    }
}

function lkkFullUrl(url, data) {
    var isFirstObj = true
    var url_ = url
    for (var key in data) {
        if (isFirstObj) {
            isFirstObj = false
            url_ = url_ + "/?" + key + "=" + encodeURIComponent(data[key])
        } else {
            url_ = url_ + "&" + key + "=" + encodeURIComponent(data[key])
        }
    }
    return url_
}

function lkkRequest({url='', params={}, method='GET', success=null, fail=null, complete=null}) {
    var lkkFullUrlString = lkkFullUrl(url, params) || ''
    var header = lkkHeader(lkkFullUrlString) || {}
    wx.request({
      url: lkkFullUrlString,
      method: method || 'GET', 
      header: header,
      success: function(res){
        // success
        console.log("request url successed:" + lkkFullUrlString)
        console.log(res)
        if (res && res.statusCode == 200) {
            (typeof success == 'function') && success(res)
        } else {
            typeof fail == 'function' && fail('发生错误')
        }
      },
      fail: function() {
        // fail
        console.log("request url faild" + lkkFullUrlString)
        typeof fail == 'function' && fail('发生错误')
      },
      complete: function() {
        // complete
        console.log("request url complete")
        typeof complete == 'function' && complete()
      }
    })
}

function request({url='', params={}, method='GET', success=null, fail=null, complete=null}) {
    wx.request({
      url: url || '',
      data: params || {},
      method: method || 'GET',
      success: function(res){
        // success
        console.log("request url successed:" + url)
        console.log(res)
        // && res.data && res.data.code == 0
        if (res && res.statusCode == 200) {
            (typeof success == 'function') && success(res.data.data)
        } else {
            typeof fail == 'function' && fail('发生错误')
        }
      },
      fail: function() {
        // fail
        console.log("request url faild" + url)
        typeof fail == 'function' && fail('发生错误')
      },
      complete: function() {
        // complete
        console.log("request url complete")
        typeof complete == 'function' && complete()
      }
    })
}

function networkErrorWithCode(code) {

}

module.exports = {
    request: request,
    lkkRequest: lkkRequest,
    networkErrorWithCode: networkErrorWithCode
}