
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
    this.customerData.shopId = options['shopId']
    this.loadComments()
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
    this.loadComments()
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: 'title', // 分享标题
      desc: 'desc', // 分享描述
      path: 'path' // 分享路径
    }
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
