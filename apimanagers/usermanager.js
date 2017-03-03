var api = require('../utils/api.js')
var apiManager = require('./apimanager.js')

function login({params = null, success = null, fail = null, complete = null}) {
  apiManager.request({url: api.userLoginUrl(), params: params, success: success, fail: fail, complete: complete})
}

function uploadUserLocation(userId, la, lo) {

}

module.exports = {
    login: login,
    uploadUserLocation: uploadUserLocation
}
