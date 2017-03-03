function lkkHost() {
    return 'https://api2.lekongkong.com'
}

function lkkUploadImageConfigUrl() {
    return lkkHost() + 'api/config.getImgConfig'
}

function host() {
    return 'http://crmtest.baixing.com.cn'
}

function userLoginUrl() {
    return host() + '/judy/wxa/comment?debug=0532'
}

function shopListUrl() {
    return host() + '/judy/wxa/shop'
}

function shopDetailUrl(shopId) {
    return host() + "/judy/wxa/shop/" + shopId
}

//评论店铺url
function commentShopUrl(shopId) {
    return host() + '/judy/wxa/shop/' + shopId+ '/comment'
}

//店铺评论url
function shopCommentsUrl(shopId) {
    return host() + '/judy/wxa/shop/'+shopId+'/comment'
}

function shopCommentDetailUrl(commentId) {
    return host() + '/judy/wxa/comment/' + commentId
}

//获取店铺评论的配置url
function shopCommentConfigsUrl(shopId) {
    return host() + ''
}

//用户收藏的店铺
function userCollectedShopsUrl(userId) {
    return host() + userId
}

//用户收藏店铺url
function userCollectShopUrl(shopId) {
    return host() + '/judy/wxa/shop/'+ shopId + '/collect'
}

//取消收藏店铺url
function userUnCollectShopUrl(shopId) {
    return host() + '/judy/wxa/collection/shop/'+ shopId + '/cancel'
}

//评论tag
function getShopCommentTagsUrl() {
    return host() + '/judy/wxa/meta/tag'
}

//获取上传图片的config
function getUploadImageConfigUrl() {
    return 
}

module.exports = {
    host: host,
    userLoginUrl: userLoginUrl,
    shopListUrl: shopListUrl,
    shopDetailUrl: shopDetailUrl,
    commentShopUrl: commentShopUrl,
    shopCommentsUrl: shopCommentsUrl,
    shopCommentDetailUrl: shopCommentDetailUrl,
    shopCommentConfigsUrl: shopCommentConfigsUrl,
    userCollectedShopsUrl: userCollectedShopsUrl,
    userCollectShopUrl: userCollectShopUrl,
    userUnCollectShopUrl: userUnCollectShopUrl,
    getShopCommentTagsUrl: getShopCommentTagsUrl
}
