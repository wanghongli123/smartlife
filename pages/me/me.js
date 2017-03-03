//我的页面.包括我的收藏和我的评论.

const kPageSize = 30
var shopmanager = require('../../apimanagers/shopmanager.js')

Page({
  data:{
      tabNames: [],
      tabIndex: 0,
      templatePath: null,
      templateName: null
  },
  customerData: {
      tabItems: [
          {
              name: '我的收藏',
              cellName: '',
              cellPath: '',
              pageNo: 0
          },
          {
              name: '我的点赞',
              cellName: '',
              cellPath: '',
              pageNo: 0
          }
      ],
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
      let tabNames = []
      let tabItems = this.customerData.tabItems
      for (let i = 0; i < tabItems.length; i++) {
          let item = this.customerData.tabItems[i]
          tabNames.push(item.name)
      }
      this.setData({
          tabNames: tabNames
      })

      wx.getLocation({
  type: 'gcj02', //返回可以用于wx.openLocation的经纬度
  success: function(res) {
    console.log(res)
  }
})
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
  /////////////////////////////////页面事件////////////////////////////////////////////////////////////
  clickOnTabitemView: function(e) {
      this.setData({
        tabIndex: e.currentTarget.dataset.tabindex
      })
  },
  scrollViewDidScroll: function(e) {
  },
  clickOnShopCell: function(e) {
      console.log(e);
  },
  ////////////////////////////////数据相关/////////////////////////////////////////////////////////////
  loadShopsWithParams: function() {
  },
  resetLoadingShopParams: function() {
      let item = this.customerData.tabItems[this.data.tabIndex]
      item.pageNo = 0
  },
  loadingShopParams: function() {
    let item = this.customerData.tabItems[this.data.tabIndex]
      return {
          index: item.pageNo,
          pageSize: kPageSize
      }
  },
  loadShopsSuccess: function() {

  },
  loadShopFailed: function() {

  }
})
