const app = getApp()
Page({
  data: {
    alpha: app.globalData.alpha,
    num: app.globalData.num
  },
  change_alpha(e) {
    app.globalData.alpha = e.detail.value
  },
  change_num(e) {
    app.globalData.num = e.detail.value
  }
})