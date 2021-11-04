const path = require('path')
module.exports = {
  title: '尤锦利',
  description: '努力者的时代',
  plugins: ['autobar'],
  palette: path.resolve(__dirname, 'palette.styl'),
  themeConfig: {
    repo: 'github地址',
    docsDir: 'docs',
    editLinks: true,
    sidebar: 'auto',
    sidebarDepth: 5,
    // editLinkText: 'Edit this page on GitHub',
    nav: [
      { text: '首页', link: '/' },
      {
        text: 'js',
        link: '/config/js/js',
        items: [
          { text: '基础', link: '/config/js/base/index' },
          { text: '设计模式', link: '/config/js/design/index' },
        ],
      },
      { text: 'Vue', link: '/config/vue/vue' },
      {
        text: 'React',
        link: '/config/React/React',
        items: [
          { text: '基础', link: '/config/React/base/index' },
          { text: 'React-Hooks', link: '/config/React/react-hooks/index' },
          { text: 'React-Router', link: '/config/React/react-router/index' },
          { text: 'Redux', link: '/config/React/redux/index' },
        ],
      },
      { text: '问题汇总', link: '/config/front-matter1233' },
      { text: '算法&工具函数', link: '/config/front-matter123' },
      {
        text: '工程化',
        link: '/config/moduleTools',
        items: [
          {
            text: 'webpack',
            link: '/config/moduleTools/webpack',
            items: [
              {
                text: 'webpack1-文件分析',
                link: '/config/moduleTools/webpack/webpack1-文件分析',
              },
            ],
          },
          {
            text: 'rollup',
            link: '/config/moduleTools/rollup',
            items: [
              {
                text: 'rollup',
                link: '/config/moduleTools/rollup/index',
              },
            ],
          },
        ],
      },
      { text: '监控', link: '/config/front-matter123456' },
      { text: 'nginx', link: '/config/front-matter12' },
    ],

    // sidebar: {
    //   // '/config/': [
    //   //   '',
    //   //   // 'js/js'
    //   //   'front-matter',
    //   //   'palette'
    //   // ],
    // },
    smoothScroll: true,
  },
}
