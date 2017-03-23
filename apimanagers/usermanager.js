/*
* 用户管理类.
**/

var api = require('../utils/api.js')
var apiManager = require('./apimanager.js')

/*
* 用户登录.
**/
function login({params = null, success = null, fail = null, complete = null}) {
  apiManager.request({url: api.userLoginUrl(), params: params, success: success, fail: fail, complete: complete})
}

/*
* 上传用户坐标信息.
**/
function uploadUserLocation(userId, la, lo) {

}

module.exports = {
    login: login,
    uploadUserLocation: uploadUserLocation
}
