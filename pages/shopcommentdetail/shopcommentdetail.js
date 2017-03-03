//店铺点赞评论详情页面.

var app = getApp()
var shopManager = require('../../apimanagers/shopmanager.js')

Page({
  data:{
    shopInfo: null,
    shopComment: null,
    pageState: 0,
    hasRecomandShops: false
  },
  customerData: {
    shopId: '',
    commentId: '',
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
  onReady:function(){
    // 生命周期函数--监听页面初次渲染完成
  },
  onShow:function(){
    // 生命周期函数--监听页面显示
  },
  onHide:function(){
    // 生命周期函数--监听页面隐藏
  },
  onUnload:function(){
    // 生命周期函数--监听页面卸载
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: 'title', // 分享标题
      desc: 'desc', // 分享描述
      path: 'path' // 分享路径
    }
  },
  ///////////////////////////////////////////view events///////////////////////////////////////////
  clickOnPlacehoderView: function() {
      
  },
  clickOnCollectionView: function() {
    wx.showModal({
      title: '温馨提示',
      content: '是否取消收藏',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },
  clickOnFavoriteView: function() {
    //对评论点赞

  },
  clickOnCommentPhotoView: function(e) {
    this.clickOnCommentMorePhotosView()
  },
  clickOnCommentMorePhotosView: function(e) {
    wx.previewImage({
      urls: this.data.shopComment.images
    })
  },
  clickOnCollectionView: function(e) {
    if (this.customerData.isInNetworking) {
      return
    }

    var index = e.currentTarget.dataset.index
    var shops = this.data.shops
    if (index >= shops.length) {
      return
    }

    var shopInfo = this.data.shops[index]
    if (shopInfo.isCollected) {
      //取消收藏
      //取消收藏
      var that = this
      wx.showModal({
        title: '温馨提示',
        content: '是否取消收藏本店铺',
        success: function(res) {
          if (res.confirm) {
            that.unCollectShop(shopInfo.id)
          }
        }
      })
    } else {
      //收藏
      this.collectShop(shopInfo.id)
    }
  },
  clickOnPlacehoderView: function() {
    this.setData({
      pageState: 0
    })
    this.loadShopCommentInfo()
  },
  /////////////////////////////////////////////private events//////////////////////////////////////
  viewDidLoad: function(options) {
    this.customerData.shopId = options['shopId']
    this.customerData.commentId = 1// options['commentid']

    var shopComment = app.globalData.shopComment
    if (shopComment) {
      this.setData({
        pageState: 1,
        shopComment: shopComment
      })
      app.globalData.shopComment = null
    } else {
      this.loadShopCommentInfo()
    }

    // this.loadShopInfo()
  },
  loadShopInfo: function() {
    var that = this
    shopManager.loadShopDetailWithParams({shopId: this.customerData.shopId, success: function(shopInfo) {
      that.setData({
        shopInfo: shopInfo
      })
    }})
  },
  loadShopCommentInfo: function() {
    var that = this
    shopManager.loadShopCommentDetailWithParams({commentId: this.customerData.commentId, success: function(shopComment) {
      that.setData({
        shopComment: shopComment || {},
        pageState: !shopComment ? 3 : 1
      })
    }, fail: function() {
      that.setData({
        pageState: 2
      })
    }, complete: function() {
      setTimeout(function(){
        that.customerData.isInNetworking = false
      }, 2000)
    }})
  },
  collectShop: function(shopId) {
    this.customerData.isInNetworking = true
    this.showLoadingView('收藏中...')
    var that = this
    shopManager.collectShopWithParams({shopId: shopId, params: {}, success: function() {
      wx.hideToast()
      that.updateShopCollectInfo(true)
    }, fail: function(er) {
      that.showLoadingView(er||'收藏店铺出错')
    }, complete: function() {
      setTimeout(function() {
        wx.hideToast()
        that.customerData.isInNetworking = false
      }, 2000)
    }})
  },
  unCollectShop: function(shopId) {
    this.customerData.isInNetworking = true

    var that = this
    this.showLoadingView('取消收藏中...')
    shopManager.unCollectShopWithParams({shopId: shopId, params: {}, success: function(){
      wx.hideToast()
      that.updateShopCollectInfo(false)
    }, fail: function(er) {
      that.showLoadingView(er||'取消收藏出错')
    }, complete: function() {
      setTimeout(function() {
        wx.hideToast()
        that.customerData.isInNetworking = false
      }, 2000)
    }})
  },
  updateShopCollectInfo: function(isCollected) {
    var shopInfo = this.data.shopInfo
    shopInfo.collected = isCollected
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