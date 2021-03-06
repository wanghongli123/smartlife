/*
*   评论管理类.
**/

var api = require('../utils/api.js')
var util = require('../utils/util.js')
var apiManager = require('./apimanager.js')

/*
*   加载店铺评论列表.
**/
function loadShopCommentsWithParams({shopId='', params={}, success=null, fail=null, complete=null}){
  apiManager.request({url: api.shopCommentsUrl(shopId), params: params, success: function(res) {
    if (typeof success != 'function') {
      return
    }

    var datas = res.data
    if (datas && datas.length) {
      for (let i = 0; i < datas.length; i++) {
        let data = datas[i]
        data.date = util.adFormatTime(data.created_at)
      }
    }

    typeof success == 'function' && success(res)
  }, fail: fail, complete: complete})
}

/*
*   加载店铺评论详情
**/
function loadShopCommentDetailWithParams({commentId='', params=null, success=null, fail=null, complete=null}) {
  apiManager.request({url: api.shopCommentDetailUrl(commentId), params: params, success: function(res) {
    if (typeof success != 'function') {
      return
    }

    res.date = util.adFormatTime(res.created_at)

    typeof success == 'function' && success(res)
  }, fail: fail, complete: complete})
}

/*
*   评价店铺.
**/
function commentShopWithParams({shopId = '', params = null, success = null, fail = null, complete = null}) {
  apiManager.request({url: api.commentShopUrl(shopId), params: params, method: 'POST', success: function(res) {
    if (typeof success != 'function') {
      return
    }

    res.date = util.adFormatTime(res.created_at)

    typeof success == 'function' && success(res)
  }, fail: fail, complete: complete})
}

/*
*   支持点赞评论.
**/
function supportComment({commentId = '', params = null, success = null, fail, complete}) {
  var url = api.supportShopCommentUrl(commentId)
  apiManager.request({url: url, method: 'POST', success: success, fail: fail, complete: complete});
}

function loadUserComments({params = null, success = null , fail, complete}) {
  var url = api.userCommentsUrl()
  apiManager.request({url: url, method: 'GET', success: success, fail: fail, complete: complete});
}

module.exports = {
    loadShopCommentsWithParams: loadShopCommentsWithParams,
    loadShopCommentDetailWithParams: loadShopCommentDetailWithParams,
    commentShopWithParams: commentShopWithParams,
    supportComment: supportComment,
    loadUserComments: loadUserComments
}
