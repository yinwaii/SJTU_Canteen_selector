//index.js
//获取应用实例
const app = getApp()

var data_get = [];
var count = 0;
var data_position = [];
var bound = [];
var data_canteen = [];
var flag = false;
var already_loading = false;

function getDistance(pos1, pos2) {
  var radLat1 = pos1[0] * Math.PI / 180.0;
  var radLat2 = pos2[0] * Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var b = pos1[1] * Math.PI / 180.0 - pos2[1] * Math.PI / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137; // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000;
  return s;
}

Page({
  data: {
    motto: '欢迎使用食堂选择器！',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log("loading~")
    this.getThePosition()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getTheData() {
    var that = this
    data_canteen=[]
    data_get = []
    count = 0
    for (var i = 0; i < 9; i++) {
      wx.request({
        url: 'https://canteen.sjtu.edu.cn/CARD/Ajax/PlaceDetails/' + (i + 1).toString() + '00',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (res) {
          if (res.data[0].Id == 36)
            res.data[0].Seat_s /= 2
          data_get.push(res.data)
          count++
          console.log("success!\n", data_get)
          if (count == 9) {
            flag = true;
            that.getOption()
          }
        },
        fail: function (res) {
          console.log("fail~\n", res)
          i--
        }
      })
    }
  },
  getThePosition() {
    if (already_loading)
      return;
    already_loading = true;
    var that = this
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: false,
      success(res) {
        data_position = []
        data_position.push(res.latitude, res.longitude)
        console.log("success", res)
        that.getTheData();
      },
      fail(res) {
        console.log("fail to get the position")
        that.getTheData();
      }
    })
    console.log("get the data")
  },
  getOption: function () {
    const canteen_pos = [
      [
        31.021971,
        121.431587
      ],
      [
        31.022806,
        121.436129
      ],
      [
        31.027262,
        121.432776
      ],
      [
        31.025225,
        121.427200
      ],
      [
        31.023707,
        121.441356
      ],
      [
        31.029199,
        121.444554
      ],
      [
        31.029533,
        121.441587
      ],
      [
        31.020846,
        121.432381
      ],
      [
        31.023504,
        121.431313
      ]
    ];
    const canteen_dic = {
      1: 1,
      2: 1,
      3: 1,
      5: 2,
      7: 2,
      8: 2,
      9: 2,
      10: 2,
      11: 3,
      12: 3,
      13: 3,
      14: 4,
      15: 4,
      17: 5,
      18: 5,
      19: 5,
      21: 6,
      22: 6,
      23: 7,
      4: 8,
      36: 9
    }
    const canteen_series = ['一餐', '二餐', '三餐', '四餐', '五餐', '六餐', '七餐', '哈乐', '玉兰苑'];

    for (var j = 0; j < 9; j++) {
      console.log(j, data_get[j])
      if (data_get[j] == undefined) {
        console.log("null?~~ ", j)
      }
      var data_get_tmp = data_get[j];
      for (var i = 0; i < data_get_tmp.length; i++) {
        data_canteen.push({
          distance: getDistance(data_position, canteen_pos[canteen_dic[data_get_tmp[i]["Id"]] - 1]),
          ratio: data_get_tmp[i]["Seat_u"] / data_get_tmp[i]["Seat_s"],
          empty_seats: (data_get_tmp[i]["Seat_s"] - data_get_tmp[i]["Seat_u"]),
          name: canteen_series[canteen_dic[data_get_tmp[0]["Id"]] - 1] + ' ' + data_get_tmp[i]["Name"],
          id:data_get_tmp[i]["Id"]
        })
      }
    }
    console.log(data_canteen)
    already_loading = false;
    this.selectCanteen()
  },
  onTabItemTap() {
    if (flag)
      this.getThePosition();
  },
  onPullDownRefresh() {
    wx.startPullDownRefresh({
      success: (res) => {
        this.getThePosition()
        wx.stopPullDownRefresh({})
      },
    })
  },
  selectCanteen() {
    bound = []
    data_canteen.sort(function (a, b) {
      return a.distance - b.distance
    })
    bound.push(data_canteen[0].distance, data_canteen[8].distance)
    data_canteen.sort(function (a, b) {
      return a.ratio - b.ratio
    })
    bound.push(data_canteen[0].ratio, data_canteen[8].ratio)
    console.log(bound)
    data_canteen.sort(function (a, b) {
      function getValue(a) {
        return (a.distance - bound[0]) / (bound[1] - bound[0]) * app.globalData.alpha + (a.ratio - bound[2]) / (bound[3] - bound[2]) * (1 - app.globalData.alpha);
      }
      return getValue(a)-getValue(b);
    })
    var res=[]
    for(var i=0;i<data_canteen.length;i++)
    {
      var a=data_canteen[i]
      res.push([(a.distance - bound[0]) / (bound[1] - bound[0]) * app.globalData.alpha + (a.ratio - bound[2]) / (bound[3] - bound[2]) * (1 - app.globalData.alpha),a.name])
    }
    console.log(res)
    this.setData({
      canteens:data_canteen.slice(0,app.globalData.num)
    })
  }
})