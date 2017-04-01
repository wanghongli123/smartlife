//我的页面.包括我的收藏和我的评论.

var app = getApp()
var util = require('../../utils/util.js')
var shopmanager = require('../../apimanagers/shopmanager.js')
var commentmanager = require('../../apimanagers/commentmanager.js')

Page({
  data:{
    tabNames: [],
    tabIndex: 0,
    datas: [],
    user: null,
    hasMore: true
  },
  customerData: {
    tabItems: [
      {
        name: '我的收藏',
        datas: [],
        page: 1,
        isInNetworking: false,
        hasMore: true,
      },
      {
        name: '我的点评',
        datas: [],
        page: 1,
        isInNetworking: false,
        hasMore: true
      }
    ],
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    var tabNames = []
    var tabItems = this.customerData.tabItems
    for (let i = 0; i < tabItems.length; i++) {
        let item = this.customerData.tabItems[i]
        tabNames.push(item.name)
    }
    var tabItem = this.customerData.tabItems[this.data.tabIndex]
    this.setData({
      hasMore: tabItem.hasMore,
      tabNames: tabNames
    })

    this.loadMoreDatas()
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
    this.loadMoreDatas()
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: 'title', // 分享标题
      desc: 'desc', // 分享描述
      path: 'path' // 分享路径
    }
  },
  /////////////////////////////////view events/////////////////////////////////////////////////////
  clickOnTabitemView: function(e) {
    var index = e.currentTarget.dataset.tabindex
    var item = this.customerData.tabItems[index]
    if (index == this.data.tabIndex && item.datas.length > 0) {
      return
    }
    
    this.setData({
      tabIndex: index,
      datas: item.datas,
      hasMore: item.hasMore,
    })

    if (item.datas.length == 0 && item.hasMore) {
      this.loadMoreDatas()
    }
  },
  clickOnShopCell: function(e) {
    var index = e.currentTarget.dataset.index
    var datas = this.data.datas
    if (index >= datas.length) {
      return
    }

    var shopInfo = datas[index]
    app.globalData.shopInfo = shopInfo
    wx.navigateTo({
      url: '../shopdetail/shopdetail?shopId=' + shopInfo.id 
    })
  },
  clickOnCollectionView: function(e) {
    var item = this.customerData.tabItems[this.data.tabIndex]
    if (item.isInNetworking) {
      return
    }

    var index = e.currentTarget.dataset.index
    var datas = this.data.datas
    if (index >= datas.length) {
      return
    }

    var shopInfo = datas[index]
    if (shopInfo.collected) {
      var that = this
      wx.showModal({
        title: '温馨提示',
        content: '是否取消收藏本店铺',
        success: function(res) {
          if (res.confirm) {
            that.unCollectShop(that.data.tabIndex, shopInfo.shop_id)
          }
        }
      })
    } else {
      //收藏
      this.collectShop(this.data.tabIndex, shopInfo.shop_id)
    }
  },
  clickOnShopCommentView: function(e) {
    var commentIndex = e.currentTarget.dataset.index
    var comments = this.data.datas
    if (!comments || comments.length <= commentIndex) {
      return
    }

    var comment = comments[commentIndex]
    app.globalData.shopComment = comment

    wx.navigateTo({
      url: '../shopcommentdetail/shopcommentdetail?shopId=' + comment.shop_id + '&commentId=' + comment.id,
    })
  },
  clickOnCommentImageView: function(e) {
    var commentIndex = e.currentTarget.dataset.commentIndex
    var comments = this.data.datas
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
    var comments = this.data.datas
    if (comments.length <= e.currentTarget.dataset.index) {
      return
    }

    var comment = comments[e.currentTarget.dataset.index]
    if (comment.isFavorited) {
      return
    }
    
    comment.isFavorited = true
    comment.support_num = comment.support_num - (-1)
    this.setData({
      datas: this.data.datas
    })

    commentmanager.supportComment({commentId: comment.id});
  },
  ////////////////////////////////private events///////////////////////////////////////////////////
  loadMoreDatas: function() {
    var item = this.customerData.tabItems[this.data.tabIndex]
    if (item.isInNetworking || !item.hasMore) {
      return
    }
    item.isInNetworking = true

    var params = this.loadingDatasParam(this.data.tabIndex)
    var complete = function() {
      setTimeout(function() {
        item.isInNetworking = false
      }, 1000)
    }
    var that = this
    if (this.data.tabIndex == 0) {      
      var success = function(res) {
        that.loadDatasSuccess(0, res)
      }
      var fail = function(res) {
        that.loadDatasFailed(0)
      }
      shopmanager.loadUserCollectionShopsWithParams({params: params, success: success, fail: fail, complete: complete})
    } else {
      var success = function(res) {
        that.loadDatasSuccess(1, res)
      }
      var fail = function(res) {
        that.loadDatasFailed(1)
      }
      commentmanager.loadUserComments({params: params, success: success, fail: fail, complete: complete})
    }
  },
  loadDatasSuccess: function(tabIndex, res) {
    var item = this.customerData.tabItems[tabIndex]
    item.datas = item.datas.concat(res.data)
    item.hasMore = item.datas.length < res.total
    if (item.hasMore) {
      item.page += 1
    }

    if (this.data.tabIndex == tabIndex) {
      this.setData({
        datas: item.datas,
        hasMore: item.hasMore
      })
    }
  },
  loadDatasFailed: function(tabIndex) {
    if (this.data.tabIndex == tabIndex) {
      this.showLoadingView('加载数据出错...')
    }
  },
  loadingDatasParam: function(tagIndex) {
    var item = this.customerData.tabItems[tagIndex]
    return {
      page: item.page
    }
  },
  collectShop: function(tabIndex, shopId) {
    var item = this.customerData.tabItems[tabIndex]
    item.isInNetworking = true

    this.showLoadingView('收藏中...')
    var that = this
    shopmanager.collectShopWithParams({shopId: shopId, success: function() {
      wx.hideToast()
      that.updateAfterCollectFinished(shopId, true)
    }, fail: function(er) {
      that.showLoadingView(er||'收藏店铺出错')
    }, complete: function() {
      setTimeout(function() {
        wx.hideToast()
        item.isInNetworking = false
      }, 1000)
    }})
  },
  unCollectShop: function(tabIndex, shopId) {
    var item = this.customerData.tabItems[tabIndex]
    item.isInNetworking = true

    var that = this
    this.showLoadingView('取消收藏中...')
    shopmanager.unCollectShopWithParams({shopId: shopId, success: function(){
      wx.hideToast()
      that.updateAfterCollectFinished(shopId, false)
    }, fail: function(er) {
      that.showLoadingView(er||'取消收藏出错')
    }, complete: function() {
      setTimeout(function() {
        wx.hideToast()
        item.isInNetworking = false
      }, 1000)
    }})
  },
  updateAfterCollectFinished: function(shopId, isCollected) {
    var tabItem = this.customerData.tabItems[0]
    for (var i = 0; i < tabItem.datas.length; i++) {
      let tshop = tabItem.datas[i]
      if (tshop.id == shopId) {
        break;
      }
    }

    if (i < tabItem.datas.length) {
      util.arrayRemoteAt(tabItem.datas, i) 
    }

    this.setData({
      datas: tabItem.datas
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
