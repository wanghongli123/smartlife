//我的页面.包括我的收藏和我的评论.

var util = require('../../utils/util.js')
var shopmanager = require('../../apimanagers/shopmanager.js')

Page({
  data:{
    tabNames: [],
    tabIndex: 0,
    shops: [],
    user: null,
    hasMore: true
  },
  customerData: {
    tabItems: [
      {
        name: '我的收藏',
        shops: [],
        page: 1,
        isInNetworking: false,
        hasMore: true,
      },
      {
        name: '我的点赞',
        shops: [],
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

    this.loadMoreShops()
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
    this.loadMoreShops()
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
    if (index == this.data.tabIndex && item.shops.length > 0) {
      return
    }
    
    this.setData({
      tabIndex: index,
      shops: item.shops,
      hasMore: item.hasMore,
    })

    if (item.shops.length == 0 && item.hasMore) {
      this.loadMoreShops()
    }
  },
  clickOnShopCell: function(e) {
    var index = e.currentTarget.dataset.index
    var shops = this.data.shops
    if (index >= shops.length) {
      return
    }

    var shopInfo = shops[index]
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
    var shops = this.data.shops
    if (index >= shops.length) {
      return
    }

    var shopInfo = shops[index]
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
  ////////////////////////////////private events///////////////////////////////////////////////////
  loadMoreShops: function() {
    var item = this.customerData.tabItems[this.data.tabIndex]
    if (item.isInNetworking) {
      return
    }
    item.isInNetworking = true

    var params = this.loadingShopParams(this.data.tabIndex)
    var complete = function() {
      setTimeout(function() {
        item.isInNetworking = false
      }, 1000)
    }
    var that = this
    if (this.data.tabIndex == 0) {      
      var success = function(res) {
        that.loadShopsSuccess(0, res)
      }
      var fail = function(res) {
        that.loadShopsFailed(0)
      }
      shopmanager.loadUserCollectionShopsWithParams({params: params, success: success, fail: fail, complete: complete})
    } else {
      var success = function(res) {
        that.loadShopsSuccess(1, res)
      }
      var fail = function(res) {
        that.loadShopsFailed(1)
      }
      shopmanager.loadUserCommentShopsWithParams({params: params, success: success, fail: fail, complete: complete})
    }
  },
  loadShopsSuccess: function(tabIndex, res) {
    var item = this.customerData.tabItems[tabIndex]
    item.shops = item.shops.concat(res.data)
    item.hasMore = item.shops.length < res.total
    if (item.hasMore) {
      item.page += 1
    }

    if (this.data.tabIndex == tabIndex) {
      this.setData({
        shops: item.shops,
        hasMore: item.hasMore
      })
    }
  },
  loadShopsFailed: function(tabIndex) {
    if (this.data.tabIndex == tabIndex) {
      this.showLoadingView('加载数据出错...')
    }
  },
  loadingShopParams: function(tagIndex) {
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
    var commentItem = this.customerData.tabItems[1]
    commentItem.shops = this.updateShopsCollectionState(shopId, isCollected, commentItem.shops)

    var collectionItem = this.customerData.tabItems[0]
    for (var i = 0; i < collectionItem.shops.length; i++) {
      let tshop = collectionItem.shops[i]
      if (tshop.id == shopId) {
        break;
      }
    }

    if (!isCollected) {
      if (i < collectionItem.shops.length) {
        util.arrayRemoteAt(collectionItem.shops, i) 
      }
    } else {
      if (i >= collectionItem.shops.length) {
        for (var i = 0; i < commentItem.shops.length; i++) {
          let tshop = commentItem.shops[i]
          if (tshop.id == shopId) {
            collectionItem.shops = [tshop].concat(collectionItem.shops)
            break;
          }
        }
      }
    }

    this.setData({
      shops: this.data.tabIndex == 0 ? collectionItem.shops : commentItem.shops
    })
  },
  updateShopsCollectionState: function(shopId, isC, shops) {
    for (let i = 0; i < shops.length; i++) {
      let shop = shops[i];
      if (shop.shop_id == shopId) {
        shop.collected = isC
        shop.collected_num += isC ? (1) : (-1)
        break;
      }
    }
    return shops
  },
  showLoadingView(msg) {
    wx.showToast({
      title: msg,
      icon: 'loading',
      duration: 1000000
    })
  },
})
