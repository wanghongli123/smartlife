function lkkHost() {
    return 'https://api2.lekongkong.com'
}

function lkkUploadImageConfigUrl() {
    return lkkHost() + 'api/config.getImgConfig'
}

function host() {
    return  'http://localhost:8888'//'http://120.77.170.68'//'http://crmtest.baixing.com.cn'//;
}

function userLoginUrl() {
    return host() + '/wxa/login' //'/judy/wxa/comment?debug=0532'
}

function shopListUrl() {
    return host() + '/wxa/shop'
}

//用户收藏的店铺
function userCollectionShopsUrl(userId) {
    return host() + '/wxa/collection'
}

//用户评论过的店铺.
function userCommentShopsUrl() {
}

//用户所有的评论.
function userCommentsUrl() {
    return host() + '/wxa/comment';
}

function shopDetailUrl(shopId) {
    return host() + "/wxa/shop/" + shopId
}

//评论店铺url
function commentShopUrl(shopId) {
    return host() + '/wxa/shop/' + shopId+ '/comment'
}

//店铺评论url
function shopCommentsUrl(shopId) {
    return host() + '/wxa/shop/'+shopId+'/comment'
}

//店铺详情
function shopCommentDetailUrl(commentId) {
    return host() + '/wxa/comment/' + commentId
}

//获取店铺评论的配置url
function shopCommentConfigsUrl(shopId) {
    return host() + ''
}

//用户收藏店铺url
function userCollectShopUrl(shopId) {
    return host() + '/wxa/shop/'+ shopId + '/collect'
}

//取消收藏店铺url
function userUnCollectShopUrl(shopId) {
    return host() + '/wxa/collection/shop/'+ shopId + '/cancel'
}

//评论tag
function getShopCommentTagsUrl() {
    return host() + '/wxa/meta/tag'
}

//获取上传图片的config
function getUploadImageConfigUrl() {
    return lkkHost() + '/api/config.getImgConfig'
}

function supportShopCommentUrl(commentId) {
    return host() + '/wxa/comment/' + commentId + "/support"
}

module.exports = {
    host: host,
    lkkHost: lkkHost,
    userLoginUrl: userLoginUrl,
    shopListUrl: shopListUrl,
    userCollectionShopsUrl: userCollectionShopsUrl,
    userCommentShopsUrl: userCommentShopsUrl,
    shopDetailUrl: shopDetailUrl,
    commentShopUrl: commentShopUrl,
    shopCommentsUrl: shopCommentsUrl,
    shopCommentDetailUrl: shopCommentDetailUrl,
    shopCommentConfigsUrl: shopCommentConfigsUrl,
    userCollectShopUrl: userCollectShopUrl,
    userUnCollectShopUrl: userUnCollectShopUrl,
    getShopCommentTagsUrl: getShopCommentTagsUrl,
    getUploadImageConfigUrl: getUploadImageConfigUrl,
    supportShopCommentUrl: supportShopCommentUrl,
    userCommentsUrl: userCommentsUrl
}
