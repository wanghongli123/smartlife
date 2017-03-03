//所有的分享相关的信息，在这里返回.

//根据别名获取页面路径.
function pagePathWithAlias(aliasNm) {
    let pages = {"shoplist": "../"}
    return pages[aliasNm]
}

function getPageShareInfo(pageAliasNm, extroInfo) {
    return {
      title: 'title', // 分享标题
      desc: 'desc', // 分享描述
      path: pagePathWithAlias(pageAliasNm) // 分享路径
    }
}

module.exports = {
    getPageShareInfo: getPageShareInfo
}
