/*
* 店铺详情页面. 
*/

const kLimitShowTagsNum = 6
var app = getApp()
var shopManager = require('../../apimanagers/shopmanager.js')
var commentManager = require('../../apimanagers/commentmanager.js')

Page({
  data:{
    shopInfo: null,
    pageState: 0,
    scrollIntoView: '',
    showAllTags: false,
    needFoldTags: false, //是否需要折叠tags
    showShopDesc: false,
    showShopCharacter: false,
  },
  customerData: {
    shopId: '',
    tags: [],
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
      title: this.data.shop.name, // 分享标题
      desc: '店铺详情', // 分享描述
      path: '/page/shopDetail?shopId=' +  this.customerData.shopId// 分享路径
    }
  },
  ///////////////////////////////////////////////view events///////////////////////////////////////
  clickOnShopImagesView: function(e) {
    var images = this.data.shopInfo.images
    if (!this.data.shopInfo || !images) {
      return
    }
    var index = e.currentTarget.dataset.index
    var current = index < images.length ? images[index] : ''
    wx.previewImage({
      current: current,
      urls: images
    })
  },
  clickOnAddressView: function() {
    if (!this.data.shopInfo || !this.data.shopInfo.areas) {
      return
    }
    wx.openLocation({
      latitude: this.data.shopInfo.areas.la - 0.0, // 纬度，范围为-90~90，负数表示南纬
      longitude: this.data.shopInfo.areas.lo - 0.0, // 经度，范围为-180~180，负数表示西经
      scale: 28, // 缩放比例
      address: this.data.shopInfo.address, // 地址的详细说明
    })
  },
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
  clickShowCommentTags: function() {
    if (!this.customerData.needFoldTags) {
      return
    }

    this.setData({
      showAllTags: !this.data.showAllTags 
    })

    var shop = this.data.shopInfo
    shop.tags = this.getShopShowTags()
    this.setData({
      shopInfo: shop 
    })
  },
  clickShowShopDesc: function() {
    this.setData({
      showShopDesc: !this.data.showShopDesc
    })
  },
  clickShowShopCharacter: function() {
    this.setData({
      showShopCharacter: !this.data.showShopCharacter
    })
  },
  clickShowMoreComments: function() {
    wx.navigateTo({
      url: '../shopcommentlist/shopcommentlist?shopId=' + this.customerData.shopId 
    })
  },
  clickOnShopCommentView: function(e) {
    var commentIndex = e.currentTarget.dataset.index
    var comments = this.data.shopInfo.comments
    if (!comments || comments.length <= commentIndex) {
      return
    }

    var comment = comments[commentIndex]
    app.globalData.shopComment = comment

    wx.navigateTo({
      url: '../shopcommentdetail/shopcommentdetail?shopId=' + this.customerData.shopId + '&commentId=' + comment.id,
    })
  },
  clickOnCommentImageView: function(e) {
    var commentIndex = e.currentTarget.dataset.commentIndex
    var comments = this.data.shopInfo.comments
    if (!comments || comments.length <= commentIndex) {
      return
    }

    var imgIndex = e.currentTarget.dataset.index
    var comment = comments[commentIndex]
    if (!comment.images || comment.images.length <= imgIndex) {
      return
    }

    wx.previewImage({
      current: comment.images[imgIndex],
      urls: comment.images
    })    
  },
  clickOnFavoriteView: function(e) {
    var comments = this.data.shopInfo.comments
    if (comments.length <= e.currentTarget.dataset.index) {
      return
    }

    var comment = comments[e.currentTarget.dataset.index]
    if (comment.isFavorited) {
      return
    }

    comment.isFavorited = true
    comment.support_num = (comment.support_num - 0) + 1
    this.setData({
      shopInfo: this.data.shopInfo
    })

    commentManager.supportComment({commentId: comment.id});
  },
  ///////////////////////////////////////////////private events////////////////////////////////////
  viewDidLoad: function(options) {
    var shopInfo = app.globalData.shopInfo
    app.globalData.shopInfo = null

    if (shopInfo) {
      this.customerData.tags = shopInfo.tags || []
      shopInfo.tags = this.getShopShowTags()
      this.customerData.hasLocalInfo = true
      this.setData({
        pageState: 1,
        shopInfo: shopInfo,
        needFoldTags: this.customerData.tags.length > kLimitShowTagsNum
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
      res.scoreSummary = this.generateShopCommentScoreSummary(res)
      this.customerData.tags = res.tags || []
      res.tags = this.getShopShowTags()
      
      this.setData({
        shopInfo: res,
        needFoldTags: this.customerData.tags.length > kLimitShowTagsNum
      })

      //加载完shop详情后，加载评论信息.
      this.loadShopComments()
    }
    var that = this
    setTimeout(function() {
      that.setData({
        pageState: that.data.pageState != 1 && !res ? 3 : 1
      })
    }, 2000)
  },
  loadShopDetailFail: function() {
    if (this.data.pageState == 1) {
      return
    }

    this.showLoadingView('加载店铺详情出错...')
    this.setData({
      pageState: 2
    })
  },
  generateShopCommentScoreSummary: function(shop) {
    var score = new Number(shop.overall_score ? shop.overall_score : 0)
    var quality_score = new Number(shop.quality_score ? shop.quality_score : 0)
    var speed_score = new Number(shop.speed_score ? shop.speed_score : 0)
    var attitude_score = new Number(shop.attitude_score ? shop.attitude_score : 0)
    return {
      score: score.toFixed(1),
      commented_num: shop.commented_num,
      otherScores: [
        {
          name: '品质',
          score: quality_score.toFixed(1)
        },
        {
          name: '速度',
          score: speed_score.toFixed(1)
        },
        {
          name: '态度',
          score: attitude_score.toFixed(1)
        }
      ]
    }
  },
  getShopShowTags: function() {
    return this.data.showAllTags ? this.customerData.tags : this.customerData.tags.slice(0, kLimitShowTagsNum)
  },
  loadShopComments: function() {
    var shopId = this.customerData.shopId
    var success = this.loadShopCommentsSuccess
    commentManager.loadShopCommentsWithParams({shopId: shopId, success: success})
  },
  loadShopCommentsSuccess: function(res) {
    if (!res || !res.data || res.data.length == 0) {
      return
    }

    var shop = this.data.shopInfo
    shop.comments = res.data.slice(0, 2)
    this.setData({
      shopInfo: shop
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
    shopInfo.collected_num += (isC? 1 : -1) 
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