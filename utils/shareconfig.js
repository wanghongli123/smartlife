//所有的分享相关的信息，在这里返回.

function getPageShareInfo(pageAliasNm, extroInfo) {
    var shareInfo = {
        'shoplist': {
            title: 'title',
            desc: 'desc',
            path: 'page/shoplist/shoplist'
        },
        'shopdetail': {
            title: 'title',
            desc: 'desc',
            path: ''
        }
    }

    return shareInfo.pageAliasNm
}

module.exports = {
    getPageShareInfo: getPageShareInfo
}
