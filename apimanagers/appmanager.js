var api = require('../utils/api.js')
var apiManager = require('./apimanager.js')

function loadShopCommentTags({params={}, success=null, fail=null, complete=null}) {
  apiManager.request({url: api.getShopCommentTagsUrl(), params: params, success: success, fail: fail, complete: complete})
}

function getUploadImageConfig({params=null, success=null, fail=null, complete=null}) {
  var url = api.getUploadImageConfigUrl()
  apiManager.lkkRequest({url: url, params: params, success: success, fail: fail, complete: complete})
}

function uploadImage({filePath='', success=null, fail=null, complete=null}) {
  getUploadImageConfig({success: function(config) {
    wx.uploadFile({
      url: config.url || '',
      filePath: filePath || '',
      name: config.fileKey || '',
      formData: config.uploadParams,
      success: function(res){
        // success
        typeof success == 'function' && success(res)
      },
      fail: function() {
        // fail
        typeof fail == 'function' && fail('上传图片失败，请检查网络...')
      },
      complete: function() {
        // complete
        typeof complete == 'function' && complete()
      }
    })
  }, fail: fail, complete: complete})
}

module.exports = {
    loadShopCommentTags: loadShopCommentTags
}
