
var app = getApp()
var shopManager = require('../../apimanagers/shopmanager.js')

Page({
  data:{
    shopInfo: {},
    pageState: 0,
    scrollIntoView: '',
    showShopDesc: false,
    showShopCharacter: false
  },
  customerData: {
    shopId: '',
    isInNetworking: false
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    if (app.globalData.loginSuccessed) {
      this.viewDidLoad(options)
    } else {
      var that = this
      app.login(function() {
        that.viewDidLoad(options)
      })
    }
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: this.data.shop.name, // 分享标题
      desc: '店铺详情', // 分享描述
      path: '/page/shopDetail?shopId=' +  this.customerData.shopId// 分享路径
    }
  },
  ///////////////////////////////////////////////view events///////////////////////////////////////
  clickOnMeView: function() {
    wx.navigateTo({
      url: '../me/me'
    })
  },
  clickOnCollectionView: function() {
    if (this.customerData.isInNetworking) {
      return
    }

    var shopId = this.data.shopInfo.id
    if (this.data.shopInfo.collected) {
      //取消收藏
      var that = this
      wx.showModal({
        title: '温馨提示',
        content: '是否取消收藏本店铺',
        success: function(res) {
          if (res.confirm) {
            that.unCollectShop(that.customerData.shopId)
          }
        }
      })
    } else {
      //收藏
      this.collectShop(this.customerData.shopId)
    }
  },
  clickOnTelphoneView: function() {
    var phone = this.data.shopInfo.mobile
    if (!phone) {
      return
    }
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  clickOnOptionView: function(e) {
    var viewId = 'view-' + e.currentTarget.dataset.index
    console.log(viewId)
    this.setData({
      scrollIntoView: viewId
    })
  },
  clickOnCommentsView: function(e) {
    wx.navigateTo({
      url: '../shopcommentlist/shopcommentlist?shopId='+this.customerData.shopId
    })
  },
  clickShowShopDesc: function() {
    this.setData({
      showShopDesc: true
    })
  },
  clickShowShopCharacter: function() {
    this.setData({
      showShopCharacter: true
    })
  },
  ///////////////////////////////////////////////private events////////////////////////////////////
  viewDidLoad: function(options) {
    var shopInfo = app.globalData.shopInfo
    app.globalData.shopInfo = null

    if (shopInfo) {
      this.customerData.hasLocalInfo = true
      this.setData({
        pageState: 1,
        shopInfo: shopInfo
      })
    } else {
      this.setData({
        pageState: 0
      })
    }
    this.customerData.shopId = options['shopId']
    this.loadShopDetailWithParams(this.loadShopDetailParams())
  },
  loadShopDetailWithParams: function(params) {
    var that = this
    var success = this.loadShopDetailSuccess
    var fail = this.loadShopDetailFail
    shopManager.loadShopDetailWithParams({shopId: this.customerData.shopId, success: success, fail: fail})
  },
  loadShopDetailParams: function() {
    return {}
  },
  loadShopDetailSuccess: function(res) {
    if (res) {
      this.setData({
        shopInfo: res
      })
    }
    var that = this
    setTimeout(function() {
      that.setData({
        pageState: that.data.pageState != 1 && !res ? 3 : 1
      })
    }, 2000)
  },
  loadShopDetailFail: function() {
    this.showLoadingView('加载店铺详情出错...')
    this.setData({
      pageState: this.data.pageState != 1 ? 1 : 2
    })
  },
  collectShop: function(shopId) {
    this.customerData.isInNetworking = true
    this.showLoadingView('处理中...')
    var that = this
    shopManager.collectShopWithParams({shopId: shopId, params: {}, success: function() {
      wx.hideToast()
      that.updateShopCollectedInfo(true)
    }, fail: function() {
      that.showLoadingView('收藏店铺出错')
      that.updateShopCollectedInfo(true)
    }, complete: function() {
      wx.hideToast()
      that.customerData.isInNetworking = false
    }})
  },
  unCollectShop: function(shopId) {
    this.customerData.isInNetworking = true
    var that = this
    this.showLoadingView('处理中...')
    shopManager.unCollectShopWithParams({shopId: shopId, params: {}, success: function(){
      wx.hideToast()
      that.updateShopCollectedInfo(false)
    }, fail: function() {
      that.showLoadingView('取消收藏出错')
    }, complete: function(){
      setTimeout(function() {
        wx.hideToast()
        that.customerData.isInNetworking = false
      }, 2000)
    }})
  },
  updateShopCollectedInfo: function(isC) {
    var shopInfo = this.data.shopInfo
    shopInfo.collected = isC
    shopInfo.collected_num += (isC?1:-1) 
    this.setData({
      shopInfo: shopInfo
    })
  },
  showLoadingView(msg) {
    wx.showToast({
      title: msg,
      icon: 'loading',
      duration: 1000000
    })
  },
})