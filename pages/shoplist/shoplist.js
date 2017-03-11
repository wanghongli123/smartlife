//店铺列表页面.
//根据返回的数据，决定最多支持三个级别.

var app = getApp()
var shareConfig = require('../../utils/shareconfig.js')
var shopManager = require('../../apimanagers/shopmanager.js')

Page({
  data: {
    shops: [],
    metaKeys: ['区域', '服务类别'],
    metaValues: [],
    showOptions: false,
    selectedMetaIndex: -1,
    optionItemsViewMaxHeight: 80,
    hasMore: true,
    windowHeight: 0,
    pageState: 0,
  },
  customerData: {
    page: 1,
    metas: [],
    isInNetworking: false
  },
  onLoad: function(options) {
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

    app.getSystemInfo(function(res) {
      that.setData({
        windowHeight: res.windowHeight,
        optionItemsViewMaxHeight: res.windowHeight * 0.6
      })
    })
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
    if (!this.data.hasMore || this.customerData.isInNetworking) {
      return
    }
    this.loadShopsWithParams()
  },
  onShareAppMessage: function() {
      return shareConfig.getPageShareInfo('shoplist')
    // 用户点击右上角分享
  },
  ///////////////////////////////////////////////view events///////////////////////////////////////
  clickOnPlacehoderView: function() {
    this.setData({
      pageState: 0
    })
    this.customerData.page = 1
    this.loadShopsWithParams()
  },
  //选择筛选选项.
  clickSelectMeta: function(e) {
    // var index
    // var showOp
    // var metaValues
    // var willScdIndex = e.currentTarget.dataset.index
    // var scdIndex = this.data.selectedMetaIndex
    // if (scdIndex == willScdIndex) {
    //     index = -1
    //     showOp = false
    //     metaValues = []
    // } else {
    //     showOp = true
    //     index = e.currentTarget.dataset.index
    //     metaValues = [['附近','上海市','苏州市','南京市'], ['附近','徐汇区','长宁区','黄浦区', 'A区', 'B区', 'C区','附近','徐汇区','长宁区','黄浦区', 'A区', 'B区', 'C区','附近','徐汇区','长宁区','黄浦区', 'A区', 'B区', 'C区'], ['徐汇区','长宁区','黄浦区', 'A区', 'B区', 'C区','附近','徐汇区','长宁区','黄浦区', 'A区', 'B区', 'C区']]
    // }

    // this.setData({
    //     showOptions: showOp,
    //     metaValues: metaValues,
    //     selectedMetaIndex: index
    // })
  },
  clickOnOptionsBgView: function() {
      this.setData({
          showOptions: false,
          metaValues: [],
          selectedMetaIndex: -1
      })
  },
  clickOnOptionItemView: function(e) {
    let metaValues = this.data.metaValues
    metaValues.push()

    this.setData({
      metaValues: metaValues
    })
  },
  //跳转的页面.
  clickOnMeView: function() {
    wx.navigateTo({
      url: '../me/me'
    })
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
    if (this.customerData.isInNetworking) {
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
            that.unCollectShop(shopInfo.id)
          }
        }
      })
    } else {
      //收藏
      this.collectShop(shopInfo.id)
    }
  },
  //////////////////////////////////////private methos/////////////////////////////////////////////
  viewDidLoad: function(options) {
    this.loadShopsWithParams()
  },
  loadShopsWithParams: function() {
    if (this.customerData.isInNetworking) {
      return
    }
    this.customerData.isInNetworking = true
    
    let params = this.loadShopsParams()
    let success = this.loadShopsSuccessed
    let fail = this.loadShopsFailed
    let that = this
    let complete = function() {
      setTimeout(function(){
        wx.hideToast()
        that.customerData.isInNetworking = false
      }, 2000)
    }
    shopManager.loadShopsWithParams({params, success, fail, complete})
  },
  resetLoadingParams: function() {
    this.customerData.pageNo = 0
  },
  loadShopsParams: function() {
    return {
      'page': this.customerData.page
    }
  },
  loadShopsSuccessed: function(res) {
    var shops = this.data.shops
    shops = shops.concat(res.data)
    var hasMore = res.total > shops.length
    this.setData({
      hasMore: hasMore,
      shops: shops || []
    })

    if (hasMore) {
      this.customerData.page += 1 
    }

    this.setData({
      pageState: shops.length==0 ? 3 : 1
    })
  },
  loadShopsFailed: function(er) {
    this.showLoadingView(er||'加载数据出错')
    this.setData({
      pageState: 2
    })
  },
  collectShop: function(shopId) {
    this.customerData.isInNetworking = true
    this.showLoadingView('收藏中...')
    var that = this
    shopManager.collectShopWithParams({shopId: shopId, success: function() {
      wx.hideToast()
      that.updateShopCollectInfo(shopId, true)
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
    shopManager.unCollectShopWithParams({shopId: shopId, success: function(){
      wx.hideToast()
      that.updateShopCollectInfo(shopId, false)
    }, fail: function(er) {
      that.showLoadingView(er||'取消收藏出错')
    }, complete: function() {
      setTimeout(function() {
        wx.hideToast()
        that.customerData.isInNetworking = false
      }, 2000)
    }})
  },
  updateShopCollectInfo: function(shopId, isCollected) {
    var hasShop = false
    var shops = this.data.shops
    for (let i = 0; i < shops.length; i++) {
      let shop = shops[i];
      if (shop.id == shopId) {
        hasShop = true
        shop.collected = isCollected
        shop.collected_num += isCollected ? (1) : (-1)
        break;
      }
    }

    if (hasShop) {
      this.setData({
        shops: shops
      })
    }
  },
  showLoadingView(msg) {
    wx.showToast({
      title: msg,
      icon: 'loading',
      duration: 1000000
    })
  },
})
