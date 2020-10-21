//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    //云服务初始化
    wx.cloud.init({
      env: 'canteen-1gehxj20c569dc94',
      traceUser: true
    })

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    wx.cloud.callFunction({
        name: 'login',
        complete: res => {
          console.log('callFunction test result: ', res)
          this.globalData.openid = res.result.openid
          this.catchData()
        }
      }),

      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                this.globalData.userInfo = res.userInfo

                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }
              }
            })
          }
        }
      })
  },
  globalData: {
    userInfo: null,
    alpha: 0.5,
    num: 3,
    openid: ""
  },
  catchData() {
    var that=this
    const db = wx.cloud.database()
    db.collection('userSettings').where({
      _id: that.globalData.openid
    }).get({
      success: function (res) {
        console.log("get the settings", res.data, res.data.length)
        if (res.data.length > 0) {
          that.globalData.alpha = res.data[0].alpha
          that.globalData.num = res.data[0].num
        } else {
          that.addData()
        }
      }
    })
  },
  addData() {
    console.log("adding the settings")
    const db = wx.cloud.database()
    db.collection('userSettings').add({
      data: {
        _id:this.globalData.openid,
        alpha: this.globalData.alpha,
        num: this.globalData.num
      },
      success: function (res) {
        console.log("add the settings", res._id)
      },
      fail: function (res) {
        console.log("fail", res)
      },
      complete: function (res) {
        console.log("added the settings")
      }
    })
  }
})