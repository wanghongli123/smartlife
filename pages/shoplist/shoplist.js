//店铺列表页面.
//根据返回的数据，决定最多支持三个级别.

var app = getApp()
const kPageSize = 30
const kMEURL = '../me/me'
var aliasNm = 'shoplist'
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
    page: 0,
    metas: [],
    isInNetWorking: false
  },
  onLoad: function(options) {
    // 生命周期函数--监听页面加载
    if (app.globalData.loginSuccessed) {
      this.viewDidLoad(options)
    } else {
      var that = this
      app.login(function() {
        that.viewDidLoad(options)
      })
    }

    let windowHeight = app.getSystemInfo(function(res) {
      that.setData({
        windowHeight: res.windowHeight,
        optionItemsViewMaxHeight: res.windowHeight * 0.6
      })
    })
  },
  onReady: function() {
    // 生命周期函数--监听页面初次渲染完成
  },
  onShow: function() {
    // 生命周期函数--监听页面显示
  },
  onHide: function() {
    // 生命周期函数--监听页面隐藏
  },
  onUnload: function() {
    // 生命周期函数--监听页面卸载
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
    if (!this.data.hasMore || this.customerData.isInNetWorking) {
      return
    }
    this.loadShopsWithParams()
  },
  onShareAppMessage: function() {
      return shareConfig.getPageShareInfo(aliasNm)
    // 用户点击右上角分享
  },
  ///////////////////////////////////////////////view events///////////////////////////////////////
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
      url: kMEURL
    })
  },
  clickOnShopCell: function(e) {
    var index = e.currentTarget.dataset.index
    var shops = this.data.shops
    if (index >= shops.length) {
      return
    }

    var shopInfo = this.data.shops[index]
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
  //////////////////////////////////////private methos/////////////////////////////////////////////
  viewDidLoad: function(options) {
    this.loadShopsWithParams()
  },
  loadShopsWithParams: function(parmas) {
    if (this.customerData.isInNetWorking) {
      return
    }
    this.customerData.isInNetWorking = true
    
    let params = this.loadShopsParams()
    let success = this.loadShopsSuccessed
    let failed = this.loadShopsFailed
    let that = this
    let completed = function() {
      setTimeout(function(){
        wx.hideToast()
        that.customerData.isInNetWorking = false
      }, 2000)
    }
    shopManager.loadShopsWithParams({params, success, failed, completed})
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
      shops: shops,
      hasMore: hasMore
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
  },
  collectShop: function(shopId) {
    this.customerData.isInNetworking = true
    this.showLoadingView('收藏中...')
    var that = this
    shopManager.collectShopWithParams({shopId: shopId, params: {}, success: function() {
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
    shopManager.unCollectShopWithParams({shopId: shopId, params: {}, success: function(){
      wx.hideToast()
      that.updateShopCollectInfo(shopId, false)
    }, fail: function(er) {
      that.showLoadingView(er||'取消收藏出错')
    }, complete: function() {
      setTimeout(function() {
        wx.hideToast()
        that.customerData.isInNetWorking = false
      }, 2000)
    }})
  },
  updateShopCollectInfo: function(shopId, isCollected) {
    var hasShop = false
    var shops = this.data.shops
    for (let i = 0; i < shops.length; i++) {
      let shop = shops[i];
      if (shop.id == shopId) {
        shop.isCollected = isCollected
        hasShop = true
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
