import * as echarts from '../../ec-canvas/echarts';

const app = getApp();
var data_get = [];
var count = 0;
var data_position = [];
var flag = false;
var already_loading=false;
var Chart = null;

function sleep(numberMillis) {
  var now = new Date();
  var exitTime = now.getTime() + numberMillis;
  while (true) {
    now = new Date();
    if (now.getTime() > exitTime)
      return;
  }
}

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
    ec: {
      lazyLoad: true
    }
  },
  onLoad(options) {
    this.echartsComponnet = this.selectComponent('#mychart-dom-scatter');
    this.getThePosition();
  },
  getTheData() {
    var that = this
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
            flag=true;
            if (!Chart)
              that.init_echarts();
            else
              that.setOption(Chart)
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
    if(already_loading)
      return;
    already_loading=true;
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
  init_echarts: function () {
    console.log('hi~')
    this.echartsComponnet.init((canvas, width, height, dpr) => {
      // 初始化图表
      Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      this.setOption(Chart);
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },
  setOption: function (Chart) {
    Chart.clear(); // 清除
    Chart.setOption(this.getOption()); //获取新数据
    already_loading=false;
  },
  getOption: function () {
    var canteen_pos = [
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
    var canteen_dic = {
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
    var canteen_series = ['一餐', '二餐', '三餐', '四餐', '五餐', '六餐', '七餐', '哈乐', '玉兰苑'];
    var canteen_colour_src=["#70F3FF", "#FF461F", "#9ED900", "#B36D61", "#725E82", "#2E4E7E", "#88ADA6", "#4C221B", "#7FECAD"];
    var canteen_colour=[];
    var data_canteen = [];

    for (var j = 0; j < 9; j++) {
      var tmp = [];
      console.log(j, data_get[j])
      if (data_get[j] == undefined) {
        console.log("null?~~ ", j)
      }
      var data_get_tmp = data_get[j];
      for (var i = 0; i < data_get_tmp.length; i++) {
        tmp.push(
          [
            getDistance(data_position, canteen_pos[canteen_dic[data_get_tmp[i]["Id"]] - 1]),
            data_get_tmp[i]["Seat_u"] / data_get_tmp[i]["Seat_s"],
            (data_get_tmp[i]["Seat_s"] - data_get_tmp[i]["Seat_u"]),
            data_get_tmp[i]["Name"],
            data_get_tmp[i]["Id"],
          ]
        )
      }
      canteen_colour.push(canteen_colour_src[canteen_dic[data_get_tmp[0]["Id"]]-1])
      data_canteen.push({
        type: 'scatter',
        name: canteen_series[canteen_dic[data_get_tmp[0]["Id"]] - 1],
        data: tmp,
        label: {
          show: true,
          formatter: '{@[3]}\n{@[2]}'
        }
      })
    }
    console.log(data_canteen)

    var option = {
      color: canteen_colour,
      backgroundColor: '#eee',
      xAxis: {
        type: 'value',
        name: '距离/km',
        nameLocation: 'center',
        nameGap: 22
      },
      yAxis: {
        type: 'value',
        name: '人数座位比',
        nameLocation: 'end'
      },
      grid: {
        top: '90',
        bottom: '60'
      },
      legend: {
        data: canteen_series,
        textStyle: {
          width: '90%',
          height: '90%',
          fontSize: 14
        },
        padding: 8,
      },
      visualMap: {
        show: false,
        dimension: 2,
        max: 800,
        inRange: {
          symbolSize: [20, 70]
        }
      },
      series: data_canteen,
      animationDelay: function (idx) {
        return idx * 50;
      },
      animationEasing: 'elasticOut'
    }
    return option;
  },
  onTabItemTap() {
    if(flag)
      this.getThePosition();
  },
  onPullDownRefresh() {
    wx.startPullDownRefresh({
      success: (res) => {
        this.getThePosition()
        wx.stopPullDownRefresh({})
      },
    })
  }
})