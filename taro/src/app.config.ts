export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/policy/index',
    'pages/marketplace/index',
    'pages/events/index',
    'pages/profile/index',
    'pages/news/index',
    'pages/invite/index',
    'pages/webview/index',
    'pages/terms/index',
    'pages/privacy/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'WeOPC',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F5F5F5',
  },
  tabBar: {
    color: '#6B7280',
    selectedColor: '#111827',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/images/tab-home.png',
        selectedIconPath: 'assets/images/tab-home-active.png',
      },
      {
        pagePath: 'pages/policy/index',
        text: '政策',
        iconPath: 'assets/images/tab-policy.png',
        selectedIconPath: 'assets/images/tab-policy-active.png',
      },
      {
        pagePath: 'pages/marketplace/index',
        text: '需求',
        iconPath: 'assets/images/tab-market.png',
        selectedIconPath: 'assets/images/tab-market-active.png',
      },
      {
        pagePath: 'pages/events/index',
        text: '活动',
        iconPath: 'assets/images/tab-events.png',
        selectedIconPath: 'assets/images/tab-events-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/images/tab-profile.png',
        selectedIconPath: 'assets/images/tab-profile-active.png',
      },
    ],
  },
})
