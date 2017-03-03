//店铺评论、点赞页面.

var app = getApp()
var config = require('../../config.js')
var appManager = require('../../apimanagers/appmanager.js')
var shopManager = require('../../apimanagers/shopmanager.js')
// const config.kMaxCommentSelectedTagCount = config.kMaxCommentSelectedTagCount
// const kInputLimit = config.kMaxCommentInputCount
// const kShowedTagLimit = config.kMaxCommentLimitShowedTagCount
// const kScoreLabels = config.kCommentScoreLabels

Page({
  data:{
    totalScore: 0,
    totalScoreLabel: config.kCommentScoreLabels[0],
    pinzhiScore: 0,
    pinzhiScoreLabel: config.kCommentScoreLabels[0],
    suduScore: 0,
    suduScoreLabel: config.kCommentScoreLabels[0],
    taiduScore: 0,
    taiduScoreLabel: config.kCommentScoreLabels[0],
    images: [],
    canAddingMorePhotos: true,
    comment: '',
    canInputCommentCount: config.kMaxCommentInputCount,
    advice:'',
    canInputAdviceCount: config.kMaxCommentInputCount,
    tags: [],
    tagEnable: true,
    showAddingMoreTag: false,
    shopInfo: null,
    pageState: 0,
    postingEnable: false,
  },
  customerData: {
    tags: [],
    shopId: '',
    serviceId: '',
    uploadImageKeys: [],
    isInNetworking: false,
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    if (app.globalData.loginSuccessed) {
      this.viewDidLoad(options)
    } else {
      var that = this
      app.login(function() {
        that.viewDidLoad(options)
      })
    }
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
  
  ///////////////////////////////////////////view events////////////////////////////////////////
  clickOnDeleteImageView: function(e) {
    var index = e.currentTarget.dataset.index
    var images = this.data.images
  },
  clickOnAddingImageView: function() {
    var that = this
    wx.chooseImage({
      count: config.kMaxCommentImageCount - this.images.count, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res){
        // success
        if (!res.tempFilePaths || res.tempFilePaths.length == 0) {
          return
        }

        let images = that.data.images
        images = images.concat(res.tempFilePaths)
        that.setData({
          images: images,
          canAddingMorePhotos: images.length < config.kMaxCommentImageCount
        })
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },
  clickOnCommentInputView: function() {
    this.setData({
      adviceActive: false,
      commentActive: true
    })
  },
  clickOnAdviceInputView: function() {
    this.setData({
      adviceActive: true,
      commentActive: false
    })
  },
  clickOnShowMoreTagsView: function() {
    //点击显示更多的可选评价.
  },
  clickOnScoreView: function(e) {
    //点击在综合评分上
    let key = e.currentTarget.dataset.key
    if (!key) {
      return
    }

    switch(key) {
      case 'totalScore': {
        this.updatePostintViewEnable()
        this.setData({
          totalScoreLabel: config.kCommentScoreLabels[e.currentTarget.dataset.score],
          totalScore: e.currentTarget.dataset.score
        })
        break;
      }
      case 'pinzhiScore': {
        this.setData({
          pinzhiScore: e.currentTarget.dataset.score,
          pinzhiScoreLabel: config.kCommentScoreLabels[e.currentTarget.dataset.score]
        })
        break;
      }
      case 'suduScore': {
        this.setData({
          suduScore: e.currentTarget.dataset.score,
          suduScoreLabel: config.kCommentScoreLabels[e.currentTarget.dataset.score]
        })
        break;
      }
      case 'taiduScore': {
        this.setData({
          taiduScore: e.currentTarget.dataset.score,
          taiduScoreLabel: config.kCommentScoreLabels[e.currentTarget.dataset.score]
        })
        break;
      }
      default:{}
    }
  },
  clickOnPostingCommentView: function() {
    if (!this.data.postingEnable) {
      return;
    }

    if (this.customerData.isInNetworking) {
      return
    }
    this.customerData.isInNetworking = true
    this.showLoadingView('发布中, 请稍后...')
    this.uploadImages()
  },
  clickOnShopTagView: function(e) {
    var tags = this.data.tags
    var tag = tags[e.currentTarget.dataset.index]
    //只可以选择最多三个tag.
    if (!tag.isSelected&&!this.data.tagEnable) {
      wx.showToast({
        title: '标签最多可以选择三个.',
        icon: 'success',
        duration: 2000
      })
      return
    }

    if (tag.isSelected) {
      tag.isSelected = !tag.isSelected
      this.setData({
        tags: tags,
        tagEnable: true
      })
      this.updatePostintViewEnable()
      return
    }

    var selectedTagC = 0
    for (let i = 0 ; i < tags.length; i++) {
      let tt = tags[i]
      if (tt.isSelected) {
        selectedTagC++;
      }
      if (selectedTagC==2) {
        break
      }
    }
    
    tag.isSelected = !tag.isSelected
    if (tag.isSelected) {
      selectedTagC++;
    }

    this.setData({
      tags: tags,
      tagEnable: selectedTagC < 3 
    })

    this.updatePostintViewEnable()
  },
  onCommentAreatextChanged: function(e) {
    this.setData({
      comment: e.detail.value,
      canInputCommentCount: config.kMaxCommentInputCount - e.detail.value.length
    })
  },
  onAdviceAreatextChanged: function(e) {
    this.setData({
      advice: e.detail.value,
      canInputAdviceCount: config.kMaxCommentInputCount - e.detail.value.length
    })
  },
  ////////////////////////////////////////////private events///////////////////////////////////////
  viewDidLoad: function(options) {
    this.customerData.shopId = options['shopId']
    this.customerData.serviceId = options['serviceId']

    var that = this
    app.loadShopCommentTags(function(tags) {
      that.setData({
        showAddingMoreTag: (tags.length > config.kMaxCommentLimitShowedTagCount),
        tags: tags.slice(0, tags.length > config.kMaxCommentLimitShowedTagCount ? config.kMaxCommentLimitShowedTagCount : tags.length)
      })
      that.customerData.tags = tags
    })

    shopManager.loadShopDetailWithParams({shopId: '1', success: function(shopInfo) {
      that.setData({
        pageState: 1,
        shopInfo: shopInfo
      })
    }, fail: function() {
      that.setData({
        pageState: 2
      })
    }})
  },
  selectedTagsForPosting: function() {
    var tags = this.data.tags
    var selectedTags = []
    for (let i = 0; i < tags.length; i++) {
      let tempTag = tags[i]
      if (tempTag.isSelected) {
        selectedTags.push(tempTag.id)
      }

      if (selectedTags.length == 3) {
        break
      }
    }

    return selectedTags
  },
  uploadImages: function() { 
    //已经全部上传完，可以上传具体的评论内容.
    if (this.customerData.uploadedImageKeys.length == this.data.images.length) {
      this.postShopComment()
    } else {
      var that = this
      var image = this.data.images[this.customerData.uploadedImageKeys.length]
      appManager.uploadImage({filePath: image, success: function(imageKey) {
        that.customerData.uploadedImageKeys.push(imageKey)
        that.uploadImages
      }, fail: function(er) {
        that.customerData.uploadedImageKeys = []
        that.showLoadingView(er || '上传图片发生错误，请检查网络...')
        setTimeout(function() {
          wx.hideToast()
        }, 2000)
      }})
    }
  },
  postShopComment: function() {
    var params = {
      attitude_score: this.data.taiduScore,
      category_id: this.customerData.serviceId,
      images: this.customerData.uploadImageKeys,
      overall_score: this.data.totalScore,
      quality_score: this.data.pinzhiScore,
      speed_score: this.data.suduScore,
      tags: this.selectedTagsForPosting(),
      content: this.data.comment,
      suggestion: this.data.advice,
      id: this.customerData.shopId
    }
    var that = this
    shopManager.commentShopWithParams({params: params, success: function(res) {
      that.showLoadingView('发布成功!')
      setTimeout(function() {
        that.gotoShopCommentDetailView(res.commentId)
      }, 2000)
    }, fail: function(){
      that.showLoadingView('发布失败!')
    }, complete: function() {
      setTimeout(function(){
        that.customerData.isInNetworking = false
        wx.hideToast()
      }, 2000)
    }})
  },
  showLoadingView(msg) {
    wx.showToast({
      title: msg,
      icon: 'loading',
      duration: 1000000
    })
  },
  gotoShopCommentDetailView: function(commentId) {
    wx.navigateTo({
      url: '../shopcommentdetail/shopcommentdetail?commentId=' + commentId
    })
  },
  updatePostintViewEnable: function() {
    var hasSelectedTag = false
    var tags = this.data.tags
    for (let i = 0; i < tags.length; i++) {
      let tag = tags[i]
      if (tag.isSelected) {
        hasSelectedTag = true
        break;
      }
    }

    this.setData({
      postingEnable: hasSelectedTag && this.data.totalScore > 0
    })
  }
})