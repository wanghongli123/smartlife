
var shopManager = require('../../apimanagers/shopmanager.js')

Page({
  data:{
    comments: [],
    pageState: 0,
    hasMore: false
  },
  customerData: {
    page: 0,
    shopId: '',
    isInNetworking: false
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    this.customerData.shopId = options['shopId'] || 1
    this.loadComments()
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
    this.loadComments()
  },
  /////////////////////////////////////////////view events/////////////////////////////////////////
  clickOnShopCommentView: function(e) {
    var comment = this.data.shopComments[e.currentTarget.dataset.index]
    app.globalData.shopComment = comment
    wx.navigateTo({
      url: './shopcommentdetail?shopId='+this.customerData.shopId+'&commentId='+comment.id
    })
  },
  /////////////////////////////////////////////private events//////////////////////////////////////
  loadComments: function() {
    if (this.customerData.isInNetworking) {
      return
    }
    this.customerData.isInNetworking = true

    var that = this
    shopManager.loadShopCommentsWithParams({shopId: this.customerData.shopId, params:this.loadCommentsParams(), success: this.loadCommentsSuccess, fail: this.loadCommentsFail, compelte: function() {
      setTimeout(function() {
        that.customerData.isInNetworking = false
      }, 2000)
    }})
  },
  loadCommentsParams: function() {
    return {
        page: this.customerData.page
    }
  },
  loadCommentsSuccess: function(res) {
    if (!res) {
      return
    }  

    var tempComments = res.data
    var comments = this.data.comments
    if (tempComments && tempComments.length) {
      comments = comments.concat(tempComments)
      this.setData( {
        comments: comments
      })
    }

    var hasMore = tempComments.length > res.per_page
    if (hasMore) {
      this.customerData.page += 1
    }
    this.setData({
      hasMore: hasMore,
      pageState: (this.data.pageState != 1 && tempComments.length == 0)?3:1
    })
  },
  loadCommentsFail: function(er) {
    this.showLoadingView(er||'加载数据出错')
    this.setData({
      pageState: 2
    })
    setTimeout(function(){
      wx.hideToast()
    }, 2000)
  },
  showLoadingView(msg) {
    wx.showToast({
      title: msg,
      icon: 'loading',
      duration: 1000000
    })
  },
})
