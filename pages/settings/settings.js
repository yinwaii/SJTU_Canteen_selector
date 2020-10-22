const app = getApp()
Page({
  data: {
    alpha: app.globalData.alpha,
    num: app.globalData.num
  },
  change_alpha(e) {
    app.globalData.alpha = e.detail.value
    this.setSettings()
  },
  change_num(e) {
    app.globalData.num = e.detail.value
    this.setSettings()
  },
  setSettings() {
    const db = wx.cloud.database()
    db.collection('userSettings').doc(app.globalData.openid).update({
      data: {
        alpha: app.globalData.alpha,
        num: app.globalData.num
      },
      success: function (res) {
        console.log("setting the settings", res)
      }
    })
  },
  onTabItemTap(){
    this.setData({
      alpha: app.globalData.alpha,
      num: app.globalData.num
    })
  }
})