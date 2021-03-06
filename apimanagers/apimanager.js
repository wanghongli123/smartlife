/*
* api管理类.
**/

const kQQKAPIClientKey = "api_wxapplekongkong"
const kQQKAPIClientSecret = "ed6a36bd83f58b68a62a40ebb1f6a210"
const kQQKAPIHost = "api_wxapplekongkong"
const kUDID = "d33d2fce6c1748beb102dd7abb7f8cef"
const kUSERTOKEN = ""

var util = require("../utils/util.js")
var config = require("../config.js")
var api = require('../utils/api.js')

function lkkRequest({url, data, method, success, fail, complete}) {
    var fullUrlString = lkkFullUrl(url, data)
    console.log("request url:" + fullUrlString)
    wx.request({
      url: fullUrlString,
      data: {},
      method: method, 
      header: lkkHeader(fullUrlString), // 设置请求的 header
      success: function(res){
        // success
        console.log("request url successed:" + fullUrlString)
        console.log(res)
        if (res && res.statusCode == 200) {
            (typeof success == 'function') && success(res.data)
        } else {
            typeof fail == 'function' && fail('发生错误')
        }
      },
      fail: function() {
        // fail
        console.log("request url faild" + fullUrlString)
        typeof fail == 'function' && fail('发生错误')
      },
      complete: function() {
        // complete
        console.log("request url complete")
        typeof complete == 'function' && complete()
      }
    })
}

function lkkAPIHash(url) {
    var host = api.lkkHost()
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
        "BAPI-HASH": lkkAPIHash(url),
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

function request({url='', params={}, method='GET', success=null, fail=null, complete=null}) {
    var uid = wx.getStorageSync('login_token')
    wx.request({
      url: url || '',
      data: params || {},
      method: method || 'GET',
      header: {'token': uid},
      success: function(res){
        // success
        console.log("request url successed:" + url)
        if (res && res.statusCode == 200 && res.data && res.data.code == 0) {
            (typeof success == 'function') && success(res.data.data)
        } else {
            typeof fail == 'function' && fail(res.data.msg || '发生错误')
        }
      },
      fail: function() {
        // fail
        console.log("request url faild" + url)
        typeof fail == 'function' && fail(res.data.msg  || '发生错误')
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
