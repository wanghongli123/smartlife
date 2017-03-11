
var app = getApp();
var shopManager = require('../../apimanagers/shopmanager.js')

Page({
  data:{
    comments: [],
    pageState: 0,
    hasMore: false
  },
  customerData: {
    page: 1,
    shopId: '',
    isInNetworking: false
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    var that = this
    setTimeout(function() {
      that.customerData.shopId = options['shopId']
      that.loadComments()
    }, 500)
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
    this.loadComments()
  },
  /////////////////////////////////////////////view events/////////////////////////////////////////
  clickOnPlacehoderView: function() {
    this.setData({
      pageState: 0
    })
    this.loadShopCommentInfo()
  },
  clickOnShopCommentView: function(e) {
    var commentIndex = e.currentTarget.dataset.index
    var comments = this.data.comments
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
    var comments = this.data.comments
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
