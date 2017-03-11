//店铺点赞评论详情页面.

var app = getApp()
var shopManager = require('../../apimanagers/shopmanager.js')

Page({
  data:{
    pageState: 0,
    shopInfo: null,
    shopComment: null,
    hasRecomandShops: false
  },
  customerData: {
    shopId: '',
    commentId: '',
    isInNetworking: false
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    var that = this
    setTimeout(function() {
      if (app.globalData.loginSuccessed) {
        that.viewDidLoad(options)
      } else {
        app.login(function() {
          that.viewDidLoad(options)
        })
      }
    }, 500)
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: this.data.shopInfo.name, // 分享标题
      desc: '', // 分享描述
      path: '/pages/shopcommentdetail/shopcommentdetail?shopId='+this.customerData.shopId+'&commentId'+this.customerData.commentId
    }
  },
  ///////////////////////////////////////////view events///////////////////////////////////////////
  clickOnFavoriteView: function() {
    //对评论点赞
  },
  clickOnCommentPhotoView: function(e) {
    var images = this.data.shopComment.images
    var index = e.currentTarget.dataset.index
    if (!images || index >= images.length) {
      return
    }

    wx.previewImage({
      current: images[index],
      urls: images,
    })
  },
  clickOnCollectionView: function(e) {
    if (this.customerData.isInNetworking) {
      return
    }

    var shopInfo = this.data.shopInfo
    if (shopInfo.collected) {
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
  /////////////////////////////////////////////private events//////////////////////////////////////
  viewDidLoad: function(options) {
    this.customerData.shopId = options['shopId']
    this.customerData.commentId = options['commentId']

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

    var shopInfo = app.globalData.shop
    if (shopInfo) {
      this.setData({
        shopInfo: shopInfo
      })
    } else {
      this.loadShopInfo()
    }
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
        shopComment: shopComment || that.data.shopComment,
        pageState: that.data.pageState != 1 && !shopComment ? 3 : 1
      })
    }, fail: function() {
      if (that.data.pageState != 1) {
        that.setData({
          pageState: 2
        })
      }
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
    shopInfo.collected_num += isCollected ? (1) : (-1)
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