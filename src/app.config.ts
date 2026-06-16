export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/plan/index',
    'pages/record/index',
    'pages/reminder/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '健康用药',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f0fdf4'
  },
  tabBar: {
    color: '#9ca3af',
    selectedColor: '#22c55e',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/plan/index',
        text: '用药计划'
      },
      {
        pagePath: 'pages/record/index',
        text: '记录'
      },
      {
        pagePath: 'pages/reminder/index',
        text: '提醒'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
