//店铺管理类.
var api = require('../utils/api.js')
var apiManager = require('./apimanager.js')

//加载推荐店铺列表信息.
function loadShopsWithParams({params=null, success=null, fail=null, complete=null}) {
  apiManager.request({url: api.shopListUrl(), params: params, success: success, fail: fail, complete: complete})
}

//加载店铺详情.
function loadShopDetailWithParams({shopId = '',params=null, success=null, fail=null, complete=null}) {
  apiManager.request({url: api.shopDetailUrl(shopId), params: params, success: success, fail: fail, complete: complete})
}

//加载用户收藏的店铺.
function loadUserCollectedShopsWithParams() {
    return []
}

//加载用户评论的店铺.
function loadUserCommentedShopsWithParams() {
    return []
}

//加载用户已预约的店铺.
function loadBookedShopsWithParams() {
    return []
}

//收藏店铺信息.
function collectShopWithParams({shopId, params = null, success = null, fail = null, complete = null}) {
  apiManager.request({url: api.userCollectShopUrl(shopId), params: params, success: success, fail: fail, complete: complete})
}

//取消收藏店铺信息.
function unCollectShopWithParams({params = null, success = null, fail = null, complete = null}) {
  apiManager.request({url: api.userUnCollectShopUrl(shopId), params: params, success: success, fail: fail, complete: complete})
}

//加载店铺评论列表.
function loadShopCommentsWithParams({shopId='', params={}, success=null, fail=null, complete=null}){
  apiManager.request({url: api.shopCommentsUrl(shopId), params: params, success: success, fail: fail, complete: complete})
}

function loadShopCommentDetailWithParams({commentId='', params=null, success=null, fail=null, complete=null}) {
  apiManager.request({url: api.shopCommentDetailUrl(commentId), params: params, success: success, fail: fail, complete: complete})
}

//评价店铺.
function commentShopWithParams({params = null, success = null, fail = null, complete = null}) {
  apiManager.request({url: api.commentShopUrl(), params: params, method: 'POST', success: success, fail: fail, complete: complete})  
}

//预约店铺服务.
function bookShopWithParams() {

}

module.exports = {
    loadShopsWithParams: loadShopsWithParams,
    loadUserCollectedShopsWithParams: loadUserCollectedShopsWithParams,
    loadUserCommentedShopsWithParams: loadUserCommentedShopsWithParams,
    loadShopDetailWithParams: loadShopDetailWithParams,
    collectShopWithParams: collectShopWithParams,
    unCollectShopWithParams: unCollectShopWithParams,
    loadShopCommentsWithParams: loadShopCommentsWithParams,
    loadShopCommentDetailWithParams: loadShopCommentDetailWithParams,
    commentShopWithParams: commentShopWithParams,
    bookShopWithParams: bookShopWithParams
}