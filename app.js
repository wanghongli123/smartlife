
const kLoginCodeKey = 'kLoginSession'
var appManager = require('./apimanagers/appmanager.js')
var userManager = require('./apimanagers/usermanager.js')

//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
      var logs = wx.getStorageSync('logs') || []
      logs.unshift(Date.now())
      wx.setStorageSync('logs', logs)

      // this.getLocation(null)
      // this.loadShopCommentTags(null)
  },
  getLocation: function(cb) {
    var that = this
    if (this.globalData.location) {
      typeof cd == 'function' && cb(this.globalData.location)
    } else {
      wx.getLocation({
        type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
        success: function(res){
          // success
          that.globalData.location = res
        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })
    }
  },
  getUserInfo:function(cb){
      var that = this
      if(this.globalData.userInfo){
        typeof cb == "function" && cb(this.globalData.userInfo)
      }else{
        //调用登录接口
        wx.login({
          success: function () {
            wx.getUserInfo({
              success: function (res) {
                that.globalData.userInfo = res.userInfo
                typeof cb == "function" && cb(that.globalData.userInfo)
              }
            })
          }
        })
      }
  },
  getSystemInfo: function(cb) {
      var that = this
      if (this.globalData.systemInfo) {
        typeof cb == 'function' && cb(this.globalData.systemInfo)
      } else {
        try {
          this.globalData.systemInfo = wx.getSystemInfoSync()
          typeof cb == 'function' && cb(this.globalData.systemInfo)
        } catch (e) {}
      }
  },
  globalData:{
    location: null,
    userInfo: null,
    systemInfo: null,
    shopInfo: null,
    shopComment: null,
    loginSuccessed: false,
    userId: null,
    commentTags: null
  },
  //////////////////////////////////////////////private events/////////////////////////////////////
  login: function(cb) {
    this.showLoadingView('登录中...')
    //用户登录
    var that = this
    wx.checkSession({
      success: function(){
        //登录态未过期
        wx.getStorage({
          key: kLoginCodeKey,
          success: function(res){
            // success
            if (res) {
              that.loginWithKey(res, cb)
            } else {
              that.loginByCode(cb)
            }
          },
          fail: function() {
            // fail
            that.login(cb)
          }
        })
      },
      fail: function(){
        //登录态过期
        that.loginByCode(cb)
      }
    })
  },
  loginByCode(cb) {
    var that = this
    wx.login({
      success: function(res){
        // success
        if (res.code) {
          that.loginWithKey(res.code, cb)
        } else {
          that.loginByCode(cb)
        }
      },
      fail: function() {
        // fail
        that.loginByCode(cb)
      }
    })
  },
  loginWithKey(key, cb) {
    var that = this
    userManager.login({params: null, success: function(res) {
      wx.hideToast()
      that.globalData.loginSuccessed = true
      that.globalData.userId = res.userId
      typeof cb == 'function' && cb()
      //存储，待下次使用
      wx.setStorage({
        key: kLoginCodeKey,
        data: res.userId
      })
    }, fail: function() {
      wx.hideToast()
      that.alertUserLoginFailedAndReloginWithKey(key, cb)
    }})
  },
  showLoadingView: function(msg) {
    wx.showToast({
      title: msg,
      icon: 'loading',
      duration: 100000
    })
  },
  alertUserLoginFailedAndReloginWithKey(key, cb) {
    var that = this
    wx.showModal({
      title: '温馨提示',
      content: '当前登录失败，请重新登录',
      success: function(res) {
        that.loginWithKey(key, cb)
      }
    })
  },
  loadShopCommentTags: function(cb) {
    if (this.globalData.commentTags) {
      typeof cb == 'function' && cb(this.globalData.commentTags)
    } else {
      var that = this
      appManager.loadShopCommentTags({success: function(tags) {
        that.globalData.commentTags = tags
        typeof cb == 'function' && cb(tags)
      }})
    }
  }
})
