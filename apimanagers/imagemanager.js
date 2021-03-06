/*
* 图片上传相关管理类.
**/

var api = require('../utils/api.js')
var apiManager = require('./apimanager.js')

/*
* 获取上传图片配置信息.
**/
function getUploadImageConfig({params=null, success=null, fail=null, complete=null}) {
  var url = api.getUploadImageConfigUrl()
  apiManager.lkkRequest({url: url, params: params, success: success, fail: fail, complete: complete})
}

/*
* 上传图片接口.
**/
function uploadImage({filePath='', success=null, fail=null, complete=null}) {
  getUploadImageConfig({success: function(res) {
    let config = res.result
    wx.uploadFile({
      url: config.uploadUrl || '',
      filePath: filePath || '',
      name: config.fileKey || '',
      formData: config.uploadParams,
      success: function(res){
        // success
        if (res && res.statusCode == 200) {
          let image = JSON.parse(res.data)
          if (image && image.url) {
            image.url = 'http://lkkimg.b0.upaiyun.com' + image.url
          }
          typeof success == 'function' && success(image)
        } else {
          typeof fail == 'function' && fail('图片上传失败')
        }
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
  uploadImage: uploadImage
}
