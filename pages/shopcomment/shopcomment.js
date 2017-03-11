//店铺评论、点赞页面.
var app = getApp()
var config = require('../../config.js')
var util = require('../../utils/util.js')
var appManager = require('../../apimanagers/appmanager.js')
var shopManager = require('../../apimanagers/shopmanager.js')

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
    uploadedImageUrls: [],
    isInNetworking: false,
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
  ///////////////////////////////////////////view events////////////////////////////////////////
  clickOnDeleteImageView: function(e) {
    var index = e.currentTarget.dataset.index
    var images = this.data.images
    if (images.length <= index) {
      return
    }

    util.arrayRemoteAt(images, index)
    this.setData({
      images: images
    })
  },
  clickOnPhotoView: function(e) {
    var images = this.data.images
    var index = e.currentTarget.dataset.index
    if (images.length <= index) {
      return
    }

    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images,
    })
  },
  clickOnAddingImageView: function() {
    var that = this
    wx.chooseImage({
      count: config.kMaxCommentImageCount - this.data.images.count, // 最多可以选择的图片张数，默认9
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
    var tags = this.data.tags
    var hideTags = this.customerData.tags.slice(config.kMaxCommentLimitShowedTagCount, this.customerData.length)
    tags = tags.concat(hideTags)
    this.setData({
      tags: tags,
      showAddingMoreTag: false
    })
  },
  clickOnScoreView: function(e) {
    //点击在综合评分上
    let key = e.currentTarget.dataset.key
    if (!key) {
      return
    }

    switch(key) {
      case 'totalScore': {
        this.setData({
          totalScoreLabel: config.kCommentScoreLabels[e.currentTarget.dataset.score],
          totalScore: e.currentTarget.dataset.score
        })
        this.updatePostintViewEnable()
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
      tagEnable: selectedTagC < config.kMaxCommentSelectedTagCount
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
    this.customerData.shopId = 51//options['shopId']
    this.customerData.serviceId = 1//options['category_id']

    var that = this
    app.loadShopCommentTags(function(tags) {
      that.setData({
        showAddingMoreTag: (tags.length > config.kMaxCommentLimitShowedTagCount),
        tags: tags.slice(0, tags.length > config.kMaxCommentLimitShowedTagCount ? config.kMaxCommentLimitShowedTagCount : tags.length)
      })
      that.customerData.tags = tags
    })

    shopManager.loadShopDetailWithParams({shopId: this.customerData.shopId, success: function(shopInfo) {
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
    if (this.data.images.length == 0 || this.customerData.uploadedImageUrls.length == this.data.images.length) {
      this.postShopComment()
    } else {
      var that = this
      var image = this.data.images[this.customerData.uploadedImageUrls.length]
      appManager.uploadImage({filePath: image, success: function(image) {
        that.customerData.uploadedImageUrls.push(image.url)
        that.uploadImages()
      }, fail: function(er) {
        that.customerData.uploadedImageUrls = []
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
      images: this.customerData.uploadedImageUrls,
      overall_score: this.data.totalScore,
      quality_score: this.data.pinzhiScore,
      speed_score: this.data.suduScore,
      tags: this.selectedTagsForPosting(),
      content: this.data.comment,
      suggestion: this.data.advice,
      id: this.customerData.shopId
    }
    var that = this
    shopManager.commentShopWithParams({shopId:this.customerData.shopId, params: params, success: function(res) {
      that.showLoadingView('发布成功!')
      setTimeout(function() {
        that.gotoShopCommentDetailView(that.data.shopInfo, res)
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
  gotoShopCommentDetailView: function(shop, comment) {
    app.globalData.shop = shop
    app.globalData.shopComment = comment
    var url = '../shopcommentdetail/shopcommentdetail?shopId=' + shop.id + '&commentId=' + comment.id
    wx.redirectTo({
      url: url
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