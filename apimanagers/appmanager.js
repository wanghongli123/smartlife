/*
* app相关信息管理类.
**/

var api = require('../utils/api.js')
var apiManager = require('./apimanager.js')

/*
* 获取店铺评论标签.
**/
function loadShopCommentTags({params={}, success=null, fail=null, complete=null}) {
  apiManager.request({url: api.getShopCommentTagsUrl(), params: params, success: success, fail: fail, complete: complete})
}

module.exports = {
  loadShopCommentTags: loadShopCommentTags
}
